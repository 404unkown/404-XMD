/**
 * 404 XMD - Auto Voice Reply Command
 * Separate command for voice note auto-replies
 * Per-user configuration
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const isOwnerOrSudo = require('../lib/isOwner');
const userSettings = require('../lib/userSettings');

// Base directory for user-specific voice note files (actual audio files)
const VOICE_BASE_DIR = path.join(__dirname, '..', 'data', 'autovoice_files');

// Ensure base voice directory exists
if (!fs.existsSync(VOICE_BASE_DIR)) {
    fs.mkdirSync(VOICE_BASE_DIR, { recursive: true });
}

// Cache for faster access
const autovoiceCache = new Map();

/**
 * Get the voice notes directory for a specific user
 * @param {string} userId - The user's JID
 * @returns {string} Path to user's voice notes directory
 */
function getUserVoiceDir(userId) {
    const sanitizedId = userId.replace(/[^a-zA-Z0-9@._-]/g, '_');
    return path.join(VOICE_BASE_DIR, sanitizedId);
}

/**
 * Ensure user voice directory exists
 * @param {string} userId - The user's JID
 */
function ensureUserVoiceDir(userId) {
    try {
        const voiceDir = getUserVoiceDir(userId);
        if (!fs.existsSync(voiceDir)) {
            fs.mkdirSync(voiceDir, { recursive: true });
        }
        return voiceDir;
    } catch (error) {
        console.error(`Error ensuring voice dir for ${userId}:`, error);
        return null;
    }
}

/**
 * Check if autovoice is enabled for a specific user
 * @param {string} userId - The user's JID
 * @returns {boolean} Whether autovoice is enabled
 */
function isAutovoiceEnabled(userId) {
    try {
        if (!userId) return false;
        
        // Check cache first
        if (autovoiceCache.has(userId)) {
            return autovoiceCache.get(userId).enabled;
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'autovoice');
        
        // Store in cache
        autovoiceCache.set(userId, {
            enabled: settings.enabled || false,
            voiceNoteFile: settings.voiceNoteFile || null
        });
        
        return settings.enabled === true && settings.voiceNoteFile !== null;
    } catch (error) {
        console.error('Error checking autovoice status:', error);
        return false;
    }
}

/**
 * Get voice note file path for a specific user
 * @param {string} userId - The user's JID
 * @returns {string|null} Path to voice note or null
 */
function getUserVoiceFilePath(userId) {
    try {
        const settings = userSettings.getUserFeature(userId, 'autovoice');
        if (!settings.voiceNoteFile) return null;
        
        return path.join(getUserVoiceDir(userId), settings.voiceNoteFile);
    } catch (error) {
        console.error('Error getting voice file path:', error);
        return null;
    }
}

/**
 * Get voice note buffer for a specific user
 * @param {string} userId - The user's JID
 * @returns {Buffer|null} Voice note buffer or null
 */
function getUserVoiceNoteBuffer(userId) {
    try {
        const filePath = getUserVoiceFilePath(userId);
        if (!filePath || !fs.existsSync(filePath)) {
            return null;
        }
        return fs.readFileSync(filePath);
    } catch (error) {
        console.error(`Error getting voice note for ${userId}:`, error);
        return null;
    }
}

/**
 * Update autovoice settings for a user
 * @param {string} userId - The user's JID
 * @param {Object} updates - Settings to update
 * @returns {boolean} Success status
 */
function updateAutovoiceSettings(userId, updates) {
    try {
        const current = userSettings.getUserFeature(userId, 'autovoice');
        const newSettings = { ...current, ...updates };
        
        // Update each setting individually
        let success = true;
        for (const [key, value] of Object.entries(newSettings)) {
            const result = userSettings.updateUserSetting(userId, 'autovoice', key, value);
            if (!result) success = false;
        }
        
        // Update cache
        autovoiceCache.set(userId, newSettings);
        
        return success;
    } catch (error) {
        console.error(`Error updating autovoice for ${userId}:`, error);
        return false;
    }
}

/**
 * Save voice note for a specific user
 * @param {Object} sock - Socket connection
 * @param {Object} message - Message object
 * @param {string} userId - The user's JID
 * @returns {string} Path to saved voice note
 */
async function saveUserVoiceNote(sock, message, userId) {
    try {
        console.log(`🎤 Saving voice note for user ${userId}...`);
        
        if (!message.message?.audioMessage) {
            throw new Error('No audio message found');
        }
        
        const buffer = await downloadMediaMessage(
            message,
            'buffer',
            {},
            { 
                logger: console,
                reuploadRequest: sock.updateMediaMessage 
            }
        );
        
        if (!buffer || buffer.length === 0) {
            throw new Error('Downloaded buffer is empty');
        }
        
        console.log(`🎤 Downloaded ${buffer.length} bytes`);
        
        // Ensure user voice directory exists
        const voiceDir = ensureUserVoiceDir(userId);
        if (!voiceDir) throw new Error('Could not create voice directory');
        
        const filename = `autovoice_${Date.now()}.opus`;
        const filepath = path.join(voiceDir, filename);
        
        fs.writeFileSync(filepath, buffer);
        console.log(`🎤 Saved to: ${filepath}`);
        
        // Delete old voice note for this user
        const currentSettings = userSettings.getUserFeature(userId, 'autovoice');
        if (currentSettings.voiceNoteFile) {
            const oldPath = path.join(voiceDir, currentSettings.voiceNoteFile);
            if (fs.existsSync(oldPath) && oldPath !== filepath) {
                fs.unlinkSync(oldPath);
                console.log(`🗑️ Deleted old voice note for user ${userId}`);
            }
        }
        
        // Update settings with new filename
        updateAutovoiceSettings(userId, { voiceNoteFile: filename });
        
        return filepath;
    } catch (error) {
        console.error(`❌ Error saving voice note for ${userId}:`, error);
        throw error;
    }
}

/**
 * Migrate legacy data to new system
 */
function migrateLegacyData() {
    const LEGACY_BASE_DIR = path.join(__dirname, '..', 'data', 'autovoice');
    
    if (fs.existsSync(LEGACY_BASE_DIR)) {
        const users = fs.readdirSync(LEGACY_BASE_DIR);
        let migrated = 0;
        
        for (const userDir of users) {
            const userPath = path.join(LEGACY_BASE_DIR, userDir);
            if (fs.statSync(userPath).isDirectory()) {
                try {
                    // Reconstruct userId from directory name
                    const userId = userDir.replace(/_/g, '@');
                    
                    // Migrate config
                    const configPath = path.join(userPath, 'config.json');
                    if (fs.existsSync(configPath)) {
                        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                        
                        // Migrate voice note file if exists
                        if (config.voiceNotePath && fs.existsSync(config.voiceNotePath)) {
                            const newVoiceDir = ensureUserVoiceDir(userId);
                            const filename = path.basename(config.voiceNotePath);
                            const newPath = path.join(newVoiceDir, filename);
                            
                            // Copy voice file to new location
                            fs.copyFileSync(config.voiceNotePath, newPath);
                            
                            // Update settings
                            updateAutovoiceSettings(userId, {
                                enabled: config.enabled || false,
                                voiceNoteFile: filename
                            });
                        } else {
                            // Just migrate config without voice file
                            updateAutovoiceSettings(userId, {
                                enabled: false,
                                voiceNoteFile: null
                            });
                        }
                        
                        migrated++;
                    }
                } catch (e) {
                    console.error('Migration error for', userDir, e.message);
                }
            }
        }
        
        console.log(`✅ Migrated ${migrated} autovoice users to central system`);
    }
}

// Run migration
migrateLegacyData();

// Show recording indicator
async function showRecordingIndicator(sock, chatId) {
    try {
        await sock.sendPresenceUpdate('recording', chatId);
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error('Recording indicator error:', error);
    }
}

// Auto voice command handler
async function autovoiceCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        // Only the session owner can set their own autovoice
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner of this session!'
            }, { quoted: message });
            return;
        }

        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Get command text
        const commandText = message._originalCommand || '';
        const args = commandText.trim().split(' ').slice(1);
        
        // Get current settings
        const settings = userSettings.getUserFeature(ownerId, 'autovoice');
        
        // Check if we're saving a voice note
        const isSavingVoiceNote = (message._isVoiceNote || message._isReplyToVoiceNote) && 
                                  commandText.includes('.autovoice');
        
        if (isSavingVoiceNote) {
            try {
                console.log(`💾 Saving voice note for user ${ownerId}...`);
                let messageToSave = message;
                
                if (message._isReplyToVoiceNote) {
                    messageToSave = {
                        ...message,
                        message: {
                            audioMessage: message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage
                        }
                    };
                }
                
                await saveUserVoiceNote(sock, messageToSave, ownerId);
                updateAutovoiceSettings(ownerId, { enabled: true });
                
                await sock.sendMessage(chatId, {
                    text: '✅ *Auto Voice Reply Enabled For Your Session!*\n\nYour voice note has been saved. I will now auto-reply with this voice note to private messages in YOUR session.'
                }, { quoted: message });
                return;
            } catch (error) {
                console.error(`❌ Error saving voice note for ${ownerId}:`, error);
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to save voice note!\n\nReply to a voice note with `.autovoice` or send a voice note with caption `.autovoice`'
                }, { quoted: message });
                return;
            }
        }
        
        // Handle commands
        const action = args[0]?.toLowerCase() || '';
        
        if (!action) {
            // Show status
            const status = settings.enabled ? '🟢 ON' : '🔴 OFF';
            const voiceNoteStatus = settings.voiceNoteFile ? '✅ Set' : '❌ Not Set';
            
            const statusMessage = `🎤 *Your Auto Voice Reply*\n\nStatus: ${status}\nVoice Note: ${voiceNoteStatus}\n\n*Usage:*\n\`.autovoice on\` - Enable for your session\n\`.autovoice off\` - Disable for your session\nSend voice note with caption \`.autovoice\` to set\n\`.autovoice\` - Check status\n\n*Note:* This only affects YOUR session.`;
            
            await sock.sendMessage(chatId, {
                text: statusMessage
            }, { quoted: message });
            return;
        }
        
        if (action === 'on') {
            if (!settings.voiceNoteFile) {
                await sock.sendMessage(chatId, {
                    text: '❌ No voice note set! Send a voice note with caption `.autovoice` first.'
                }, { quoted: message });
                return;
            }
            
            updateAutovoiceSettings(ownerId, { enabled: true });
            
            await sock.sendMessage(chatId, {
                text: '✅ *Auto Voice Reply Enabled For Your Session*\n\nI will now auto-reply with voice notes to private messages in YOUR session.'
            }, { quoted: message });
            
        } else if (action === 'off') {
            updateAutovoiceSettings(ownerId, { enabled: false });
            
            await sock.sendMessage(chatId, {
                text: '❌ *Auto Voice Reply Disabled For Your Session*\n\nI will no longer auto-reply with voice notes in your session.'
            }, { quoted: message });
            
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid command! Use:\n\`.autovoice on\`\n\`.autovoice off\`\nSend voice note with caption \`.autovoice\`'
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('❌ Error in autovoice command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!'
        }, { quoted: message });
    }
}

// Handle autovoice replies
async function handleAutovoice(sock, chatId, senderId, userMessage, message) {
    try {
        // Only respond in private chats
        if (chatId.endsWith('@g.us')) return false;
        
        // Don't respond to bot's own messages
        if (message.key.fromMe) return false;
        
        // Don't respond to commands
        if (userMessage.startsWith('.')) return false;
        
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if autovoice is enabled for this specific user
        if (!isAutovoiceEnabled(ownerId)) return false;
        
        // Check if the sender is owner/sudo
        const { isSudo } = require('../lib/index');
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        const senderIsSudo = await isSudo(senderId);
        
        if (isOwner || senderIsSudo) return false;
        
        // Skip if message is too short
        if (!userMessage.trim() || userMessage.trim().length < 1) return false;
        
        // Show recording indicator before sending voice note
        await showRecordingIndicator(sock, chatId);
        
        // Small delay to make it natural
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Send voice note for this user
        const voiceBuffer = getUserVoiceNoteBuffer(ownerId);
        if (voiceBuffer) {
            await sock.sendMessage(chatId, {
                audio: voiceBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            });
            
            console.log(`🎤 Autovoice sent to ${senderId} for session owner: ${ownerId}`);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error in handleAutovoice:', error);
        return false;
    }
}

/**
 * Clear cache for a specific user
 */
function clearUserCache(userId) {
    autovoiceCache.delete(userId);
}

module.exports = {
    autovoiceCommand,
    isAutovoiceEnabled,
    handleAutovoice,
    clearUserCache
};