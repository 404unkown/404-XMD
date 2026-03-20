/**
 * 404 XMD - Text Auto Reply Command
 * Separate from voice auto-replies
 * Per-user configuration
 */

const userSettings = require('../lib/userSettings');
const isOwnerOrSudo = require('../lib/isOwner');

// Default autoreply message
const DEFAULT_MESSAGE = "Hello! I'm currently away. I'll get back to you soon.";

// Cache for faster access
const autoreplyCache = new Map();

/**
 * Check if autoreply is enabled for a specific user
 * @param {string} userId - The user's JID (the session owner)
 * @returns {boolean} Whether autoreply is enabled
 */
function isAutoreplyEnabled(userId) {
    try {
        if (!userId) return false;
        
        // Check cache first
        if (autoreplyCache.has(userId)) {
            return autoreplyCache.get(userId).enabled;
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'autoreply');
        
        // Store in cache
        autoreplyCache.set(userId, {
            enabled: settings.enabled || false,
            message: settings.message || DEFAULT_MESSAGE
        });
        
        return settings.enabled || false;
    } catch (error) {
        console.error('Error checking autoreply status:', error);
        return false;
    }
}

/**
 * Get autoreply message for a specific user
 * @param {string} userId - The user's JID (the session owner)
 * @returns {string} The autoreply message
 */
function getAutoreplyMessage(userId) {
    try {
        // Check cache first
        if (autoreplyCache.has(userId)) {
            return autoreplyCache.get(userId).message;
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'autoreply');
        const message = settings.message || DEFAULT_MESSAGE;
        
        // Store in cache
        autoreplyCache.set(userId, {
            enabled: settings.enabled || false,
            message: message
        });
        
        return message;
    } catch (error) {
        console.error('Error getting autoreply message:', error);
        return DEFAULT_MESSAGE;
    }
}

/**
 * Set autoreply state and message for a specific user
 * @param {string} userId - The user's JID
 * @param {boolean} enabled - New state
 * @param {string} message - Custom message
 * @returns {boolean} Success status
 */
function setAutoreply(userId, enabled, message = null) {
    try {
        // Get current settings
        const currentSettings = userSettings.getUserFeature(userId, 'autoreply');
        
        // Update settings
        const updatedSettings = {
            enabled: enabled,
            message: message || currentSettings.message || DEFAULT_MESSAGE
        };
        
        // Save to userSettings
        const result = userSettings.updateUserSetting(userId, 'autoreply', 'enabled', enabled) &&
                      userSettings.updateUserSetting(userId, 'autoreply', 'message', updatedSettings.message);
        
        if (result) {
            // Update cache
            autoreplyCache.set(userId, updatedSettings);
        }
        
        return result;
    } catch (error) {
        console.error(`Error setting autoreply for ${userId}:`, error);
        return false;
    }
}

/**
 * Migrate legacy data to new system
 */
function migrateLegacyData() {
    const fs = require('fs');
    const path = require('path');
    const LEGACY_DIR = path.join(__dirname, '..', 'data', 'autoreply');
    
    if (fs.existsSync(LEGACY_DIR)) {
        const files = fs.readdirSync(LEGACY_DIR);
        let migrated = 0;
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    // Extract userId from filename
                    const userId = file.replace('.json', '').replace(/_/g, '@');
                    const legacyPath = path.join(LEGACY_DIR, file);
                    const legacyData = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
                    
                    // Migrate to new system
                    setAutoreply(userId, legacyData.enabled || false, legacyData.message || DEFAULT_MESSAGE);
                    migrated++;
                } catch (e) {
                    console.error('Migration error for', file, e.message);
                }
            }
        }
        
        console.log(`✅ Migrated ${migrated} autoreply settings to central system`);
    }
}

// Run migration automatically
migrateLegacyData();

// Show typing indicator
async function showTypingIndicator(sock, chatId) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
        console.error('Typing indicator error:', error);
    }
}

// Autoreply command handler (TEXT ONLY)
async function autoreplyCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        // Only the session owner can set their own autoreply
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner of this session!'
            }, { quoted: message });
            return;
        }

        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Get command text
        const commandText = message.message?.conversation?.trim() ||
                          message.message?.extendedTextMessage?.text?.trim() || '';
        
        const args = commandText.trim().split(' ').slice(1);
        
        // Get current state
        const currentEnabled = isAutoreplyEnabled(ownerId);
        const currentMessage = getAutoreplyMessage(ownerId);
        
        // Show status if no arguments
        if (args.length === 0) {
            const status = currentEnabled ? '🟢 ON' : '🔴 OFF';
            
            const statusMessage = `📝 *Text Auto Reply*\n\n` +
                                 `Status: ${status}\n` +
                                 `Message: ${currentMessage}\n\n` +
                                 `*Usage:*\n` +
                                 `\`.autoreply on [message]\` - Enable with custom message\n` +
                                 `\`.autoreply off\` - Disable\n` +
                                 `\`.autoreply set [message]\` - Set new message\n` +
                                 `\`.autoreply\` - Check status\n\n` +
                                 `*Note:* This only affects your session.`;
            
            await sock.sendMessage(chatId, {
                text: statusMessage
            }, { quoted: message });
            return;
        }
        
        const action = args[0]?.toLowerCase() || '';
        
        if (action === 'on') {
            // Check if there's a custom message
            const customMessage = args.slice(1).join(' ');
            if (customMessage.trim()) {
                setAutoreply(ownerId, true, customMessage);
                await sock.sendMessage(chatId, {
                    text: `✅ *Text Auto Reply Enabled For Your Session*\n\nMessage: ${customMessage}\n\nI will now auto-reply to private messages in YOUR session.`
                }, { quoted: message });
            } else {
                setAutoreply(ownerId, true, currentMessage);
                await sock.sendMessage(chatId, {
                    text: `✅ *Text Auto Reply Enabled For Your Session*\n\nMessage: ${currentMessage}\n\nI will now auto-reply to private messages in YOUR session.`
                }, { quoted: message });
            }
            
        } else if (action === 'off') {
            setAutoreply(ownerId, false);
            
            await sock.sendMessage(chatId, {
                text: '❌ *Text Auto Reply Disabled For Your Session*\n\nI will no longer auto-reply to private messages in your session.'
            }, { quoted: message });
            
        } else if (action === 'set') {
            const customMessage = args.slice(1).join(' ');
            if (!customMessage.trim()) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please provide a message!\nExample: `.autoreply set I am busy now`'
                }, { quoted: message });
                return;
            }
            
            setAutoreply(ownerId, currentEnabled, customMessage);
            
            await sock.sendMessage(chatId, {
                text: `✅ *Auto Reply Message Updated For Your Session*\n\nNew message: ${customMessage}`
            }, { quoted: message });
            
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid command! Use:\n\`.autoreply on [message]\`\n\`.autoreply off\`\n\`.autoreply set [message]\`\n\`.autoreply\`'
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('❌ Error in autoreply command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!'
        }, { quoted: message });
    }
}

// Handle autoreply for private messages (TEXT ONLY)
async function handleAutoreply(sock, chatId, senderId, userMessage, message) {
    try {
        // Only respond in private chats
        if (chatId.endsWith('@g.us')) return false;
        
        // Don't respond to bot's own messages
        if (message.key.fromMe) return false;
        
        // Don't respond to commands
        if (userMessage.startsWith('.')) return false;
        
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if autoreply is enabled for this specific user
        if (!isAutoreplyEnabled(ownerId)) return false;
        
        // Check if the sender is owner/sudo
        const { isSudo } = require('../lib/index');
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        const senderIsSudo = await isSudo(senderId);
        
        if (isOwner || senderIsSudo) return false;
        
        // Skip if message is too short
        if (!userMessage.trim() || userMessage.trim().length < 1) return false;
        
        // Show typing indicator before sending reply
        await showTypingIndicator(sock, chatId);
        
        // Add a small delay to make it seem more natural
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the autoreply message for this user
        const replyMessage = getAutoreplyMessage(ownerId);
        
        // Send autoreply message WITHOUT forwarded context
        await sock.sendMessage(chatId, {
            text: replyMessage
        });
        
        console.log(`📩 Text autoreply sent to ${senderId} for session owner: ${ownerId}`);
        return true;
        
    } catch (error) {
        console.error('Error in handleAutoreply:', error);
        return false;
    }
}

/**
 * Clear cache for a specific user
 */
function clearUserCache(userId) {
    autoreplyCache.delete(userId);
}

module.exports = {
    autoreplyCommand,
    isAutoreplyEnabled,
    getAutoreplyMessage,
    setAutoreply,
    handleAutoreply,
    clearUserCache
};