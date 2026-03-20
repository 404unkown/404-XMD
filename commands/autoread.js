/**
 * mad max free bot - A WhatsApp Bot
 * Autoread Command - Automatically read all messages (Per User)
 */

const userSettings = require('../lib/userSettings');
const isOwnerOrSudo = require('../lib/isOwner');

// Cache for faster access
const autoreadCache = new Map();

/**
 * Check if autoread is enabled for a specific user
 * @param {string} userId - The user's JID
 * @returns {boolean} Whether autoread is enabled
 */
function isAutoreadEnabled(userId) {
    try {
        if (!userId) return false;
        
        // Check cache first
        if (autoreadCache.has(userId)) {
            return autoreadCache.get(userId);
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'autoread');
        const enabled = settings.enabled || false;
        
        // Store in cache
        autoreadCache.set(userId, enabled);
        
        return enabled;
    } catch (error) {
        console.error('Error checking autoread status:', error);
        return false;
    }
}

/**
 * Set autoread state for a specific user
 * @param {string} userId - The user's JID
 * @param {boolean} enabled - New state
 * @returns {boolean} Success status
 */
function setAutoreadEnabled(userId, enabled) {
    try {
        const result = userSettings.updateUserSetting(userId, 'autoread', 'enabled', enabled);
        
        if (result) {
            // Update cache
            autoreadCache.set(userId, enabled);
        }
        
        return result;
    } catch (error) {
        console.error(`Error setting autoread for ${userId}:`, error);
        return false;
    }
}

/**
 * Migrate legacy data to new system
 */
function migrateLegacyData() {
    const fs = require('fs');
    const path = require('path');
    const LEGACY_DIR = path.join(__dirname, '..', 'data', 'autoread');
    
    if (fs.existsSync(LEGACY_DIR)) {
        const files = fs.readdirSync(LEGACY_DIR);
        let migrated = 0;
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    // Extract userId from filename (reverse the sanitization)
                    const userId = file.replace('.json', '').replace(/_/g, '@');
                    const legacyPath = path.join(LEGACY_DIR, file);
                    const legacyData = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
                    
                    // Migrate to new system
                    if (legacyData.enabled) {
                        setAutoreadEnabled(userId, true);
                    }
                    migrated++;
                } catch (e) {
                    console.error('Migration error for', file, e.message);
                }
            }
        }
        
        console.log(`✅ Migrated ${migrated} autoread settings to central system`);
    }
}

// Run migration automatically (optional - can be commented out)
migrateLegacyData();

/**
 * Function to check if bot is mentioned in a message
 */
function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    // Check for mentions in contextInfo
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    // Check for explicit mentions in mentionedJid array
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some(jid => jid === botNumber)) {
                return true;
            }
        }
    }
    
    // Check for text mentions
    const textContent = 
        message.message.conversation || 
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) {
            return true;
        }
        
        const botNames = [global.botname?.toLowerCase(), 'bot', 'knight', 'mad max free bot'];
        const words = textContent.toLowerCase().split(/\s+/);
        if (botNames.some(name => words.includes(name))) {
            return true;
        }
    }
    
    return false;
}

/**
 * Toggle autoread feature for a specific user
 */
async function autoreadCommand(sock, chatId, message) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // The user who sent the command
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Check if the command sender is the owner of this session
        const isOwner = senderId === ownerId || await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner of this bot session!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'mad max free bot',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        // Get current state
        const currentState = isAutoreadEnabled(ownerId);
        
        // Toggle based on argument or toggle current state if no argument
        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'enable') {
                setAutoreadEnabled(ownerId, true);
            } else if (action === 'off' || action === 'disable') {
                setAutoreadEnabled(ownerId, false);
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ Invalid option!\n\nCurrent status: *${currentState ? 'ON' : 'OFF'}*\n\nUsage:\n.autoread on - Enable\n.autoread off - Disable`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'mad max free bot',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
        } else {
            // Toggle current state
            setAutoreadEnabled(ownerId, !currentState);
        }
        
        // Get new state after toggle
        const newState = isAutoreadEnabled(ownerId);
        
        // Send confirmation message
        await sock.sendMessage(chatId, {
            text: `✅ Auto-read has been *${newState ? 'ENABLED' : 'DISABLED'}* for your session!`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'mad max free bot',
                    serverMessageId: -1
                }
            }
        });
        
    } catch (error) {
        console.error('Error in autoread command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'mad max free bot',
                    serverMessageId: -1
                }
            }
        });
    }
}

/**
 * Handle autoread functionality for a specific session
 * @param {Object} sock - The socket connection for this session
 * @param {Object} message - The message to potentially mark as read
 * @returns {Promise<boolean>} Whether message was marked as read
 */
async function handleAutoread(sock, message) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if autoread is enabled for this specific user
        if (!isAutoreadEnabled(ownerId)) {
            return false;
        }
        
        // Get bot's ID
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if bot is mentioned
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        
        // If bot is mentioned, read the message internally but don't mark as read in UI
        if (isBotMentioned) {
            return false;
        } else {
            // For regular messages, mark as read normally
            const key = { 
                remoteJid: message.key.remoteJid, 
                id: message.key.id, 
                participant: message.key.participant 
            };
            await sock.readMessages([key]);
            return true;
        }
    } catch (error) {
        console.error('Error in handleAutoread:', error);
        return false;
    }
}

/**
 * Clear cache for a specific user
 */
function clearUserCache(userId) {
    autoreadCache.delete(userId);
}

/**
 * Get all users with autoread enabled (for stats/admin purposes)
 * @returns {Array} List of users with autoread enabled
 */
function getAutoreadEnabledUsers() {
    try {
        const enabledUsers = [];
        
        // Iterate through cache first
        autoreadCache.forEach((enabled, userId) => {
            if (enabled) {
                enabledUsers.push({
                    userId,
                    source: 'cache'
                });
            }
        });
        
        return enabledUsers;
    } catch (error) {
        console.error('Error getting autoread enabled users:', error);
        return [];
    }
}

module.exports = {
    autoreadCommand,
    isAutoreadEnabled,
    setAutoreadEnabled,
    isBotMentionedInMessage,
    handleAutoread,
    getAutoreadEnabledUsers,
    clearUserCache
};