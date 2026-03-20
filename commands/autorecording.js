/**
 * 404 XMD - Auto Recording Command
 * Shows recording indicator before sending messages
 * Per-user configuration
 */

const userSettings = require('../lib/userSettings');
const isOwnerOrSudo = require('../lib/isOwner');

// Cache for faster access
const autorecordingCache = new Map();

/**
 * Check if autorecording is enabled for a specific user
 * @param {string} userId - The user's JID (the session owner)
 * @returns {boolean} Whether autorecording is enabled
 */
function isAutorecordingEnabled(userId) {
    try {
        if (!userId) return false;
        
        // Check cache first
        if (autorecordingCache.has(userId)) {
            return autorecordingCache.get(userId);
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'autorecording');
        const enabled = settings.enabled || false;
        
        // Store in cache
        autorecordingCache.set(userId, enabled);
        
        return enabled;
    } catch (error) {
        console.error('Error checking autorecording status:', error);
        return false;
    }
}

/**
 * Set autorecording state for a specific user
 * @param {string} userId - The user's JID
 * @param {boolean} enabled - New state
 * @returns {boolean} Success status
 */
function setAutorecordingEnabled(userId, enabled) {
    try {
        const result = userSettings.updateUserSetting(userId, 'autorecording', 'enabled', enabled);
        
        if (result) {
            // Update cache
            autorecordingCache.set(userId, enabled);
        }
        
        return result;
    } catch (error) {
        console.error(`Error setting autorecording for ${userId}:`, error);
        return false;
    }
}

/**
 * Migrate legacy data to new system
 */
function migrateLegacyData() {
    const fs = require('fs');
    const path = require('path');
    const LEGACY_DIR = path.join(__dirname, '..', 'data', 'autorecording');
    
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
                    if (legacyData.enabled) {
                        setAutorecordingEnabled(userId, true);
                    }
                    migrated++;
                } catch (e) {
                    console.error('Migration error for', file, e.message);
                }
            }
        }
        
        console.log(`✅ Migrated ${migrated} autorecording settings to central system`);
    }
}

// Run migration automatically
migrateLegacyData();

// Show recording indicator BEFORE sending message (like autovoice)
async function showRecordingIndicator(sock, chatId) {
    try {
        await sock.sendPresenceUpdate('recording', chatId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Show for 1.5 seconds
    } catch (error) {
        console.error('Recording indicator error:', error);
    }
}

// Handle autorecording BEFORE sending message
async function handleAutorecording(sock, chatId, message) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if autorecording is enabled for this specific user
        if (!isAutorecordingEnabled(ownerId)) {
            return false;
        }

        // Show recording indicator
        await showRecordingIndicator(sock, chatId);
        
        return true;
    } catch (error) {
        console.error('Error in handleAutorecording:', error);
        return false;
    }
}

// Main command handler
async function autorecordingCommand(sock, chatId, message, args) {
    try {
        const sender = message.key.participant || message.key.remoteJid;
        
        // Check if user is owner/sudo
        const senderIsOwnerOrSudo = await isOwnerOrSudo(sender, sock, chatId);
        
        // Only the session owner can toggle their own autorecording
        if (!message.key.fromMe && !senderIsOwnerOrSudo) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner of this session!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Get current state
        const currentState = isAutorecordingEnabled(ownerId);

        if (!args || args.length === 0) {
            const status = currentState ? '✅ Enabled' : '❌ Disabled';
            await sock.sendMessage(chatId, {
                text: `🔊 *YOUR Auto-Recording Control*\n\n` +
                      `📊 *Your Status:* ${status}\n\n` +
                      `📝 *Usage:*\n` +
                      `• .autorecording on - Enable for YOUR session\n` +
                      `• .autorecording off - Disable for YOUR session\n` +
                      `• .autorecording status - Check YOUR status\n` +
                      `• .autorecording test - Test recording indicator\n\n` +
                      `⚙️ *Feature:* Shows "recording..." before sending messages\n` +
                      `⏱️ *Duration:* 1.5 seconds\n` +
                      `👑 *Per-User:* Yes (affects only YOUR session)`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            setAutorecordingEnabled(ownerId, true);
            
            await sock.sendMessage(chatId, {
                text: '✅ *Auto-Recording Enabled For YOUR Session*\n\nI will now show recording... before sending messages in YOUR session.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
            // Test it immediately
            await showRecordingIndicator(sock, chatId);
            await sock.sendMessage(chatId, {
                text: '✨ Recording indicator test complete!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        } 
        else if (action === 'off' || action === 'disable') {
            setAutorecordingEnabled(ownerId, false);
            
            await sock.sendMessage(chatId, {
                text: '❌ *Auto-Recording Disabled For YOUR Session*\n\nAuto recording is now off.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        else if (action === 'status' || action === 'check') {
            const status = currentState ? '✅ Enabled' : '❌ Disabled';
            await sock.sendMessage(chatId, {
                text: `📊 *YOUR Auto-Recording Status*\n\n` +
                      `🔊 *Status:* ${status}\n` +
                      `⏱️ *Duration:* 1.5 seconds\n` +
                      `📱 *Applies to:* Messages in YOUR session\n` +
                      `🔄 *Per-User:* Yes\n\n` +
                      `Your session ${currentState ? 'will show' : 'will NOT show'} recording indicator before messages.`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        else if (action === 'test') {
            await sock.sendMessage(chatId, {
                text: '🔊 *Testing Auto-Recording*\n\nRecording...',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
            await showRecordingIndicator(sock, chatId);
            
            await sock.sendMessage(chatId, {
                text: '✅ Test complete! Recording indicator worked.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ *Invalid Option*\n\n' +
                      'Available options:\n' +
                      '• `on` - Enable for YOUR session\n' +
                      '• `off` - Disable for YOUR session\n' +
                      '• `status` - Check YOUR status\n' +
                      '• `test` - Test recording indicator',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Auto-recording command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to update auto-recording settings. Please try again.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = autorecordingCommand;
module.exports.handleAutorecording = handleAutorecording;
module.exports.isAutorecordingEnabled = isAutorecordingEnabled;
module.exports.showRecordingIndicator = showRecordingIndicator;