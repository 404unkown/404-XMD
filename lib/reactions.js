const fs = require('fs');
const path = require('path');
const userSettings = require('./userSettings');
const isOwnerOrSudo = require('./isOwner');

// List of emojis for command reactions (expanded for random reactions)
const commandEmojis = ['⭐', '❤️', '🔥', '✅', '🎉', '✨', '💫', '🌟', '⚡', '💎', '🏆', '🚀', '💜', '💙', '💚', '💛', '🧡', '🖤', '🤍', '👏', '👍', '🙌', '🎯', '🔹', '🔸', '💥', '🌠', '🌀', '🔱', '🛡️', '🎶'];

// Path for storing auto-reaction state (legacy - kept for backward compatibility)
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Cache for faster access
const reactionCache = new Map();

/**
 * Check if auto-reaction is enabled for a specific user
 * @param {string} userId - The user's JID (the session owner)
 * @returns {boolean} Whether auto-reaction is enabled
 */
function isAutoReactionEnabledForUser(userId) {
    try {
        if (!userId) return false;
        
        // Check cache first
        if (reactionCache.has(userId)) {
            return reactionCache.get(userId);
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'autoreact');
        const enabled = settings.enabled !== undefined ? settings.enabled : false;
        
        // Store in cache
        reactionCache.set(userId, enabled);
        
        return enabled;
    } catch (error) {
        console.error('Error checking auto-reaction status:', error);
        return false;
    }
}

/**
 * Set auto-reaction state for a specific user
 * @param {string} userId - The user's JID
 * @param {boolean} enabled - New state
 * @returns {boolean} Success status
 */
function setAutoReactionEnabled(userId, enabled) {
    try {
        const result = userSettings.updateUserSetting(userId, 'autoreact', 'enabled', enabled);
        
        if (result) {
            // Update cache
            reactionCache.set(userId, enabled);
        }
        
        return result;
    } catch (error) {
        console.error(`Error setting auto-reaction for ${userId}:`, error);
        return false;
    }
}

/**
 * Load legacy auto-reaction state from file (for backward compatibility)
 * @deprecated Use isAutoReactionEnabledForUser instead
 */
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return data.autoReaction || false;
        }
    } catch (error) {
        console.error('Error loading auto-reaction state:', error);
    }
    return false;
}

/**
 * Save legacy auto-reaction state to file (for backward compatibility)
 * @deprecated Use setAutoReactionEnabled instead
 */
function saveAutoReactionState(state) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        
        data.autoReaction = state;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving auto-reaction state:', error);
    }
}

// Store auto-reaction state (legacy - kept for backward compatibility)
let isAutoReactionEnabled = loadAutoReactionState();

function getRandomEmoji() {
    return commandEmojis[Math.floor(Math.random() * commandEmojis.length)];
}

// Function to add reaction to a command message
async function addCommandReaction(sock, message) {
    try {
        if (!message?.key?.id) return;
        
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if auto-reaction is enabled for this specific user
        if (!isAutoReactionEnabledForUser(ownerId)) return;
        
        const emoji = getRandomEmoji();
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Error adding command reaction:', error);
    }
}

// Function to handle areact command
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isUserOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isUserOwner && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner!',
                quoted: message
            });
            return;
        }

        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        const action = args[0]?.toLowerCase();
        const currentState = isAutoReactionEnabledForUser(ownerId);
        
        if (!action) {
            await sock.sendMessage(chatId, { 
                text: `⚙️ *AUTO-REACTION*\n\nCurrent status: *${currentState ? 'ENABLED' : 'DISABLED'}* for YOUR session!\n\nAvailable emojis: ${commandEmojis.slice(0, 10).join(' ')}...\n\nUsage:\n.areact on - Enable auto-reactions\n.areact off - Disable auto-reactions`,
                quoted: message
            });
            return;
        }
        
        if (action === 'on' || action === 'enable') {
            setAutoReactionEnabled(ownerId, true);
            // Also update legacy for backward compatibility
            saveAutoReactionState(true);
            isAutoReactionEnabled = true;
            await sock.sendMessage(chatId, { 
                text: `✅ Auto-reactions have been *ENABLED* for YOUR session! Bot will react with random emojis.`,
                quoted: message
            });
        } else if (action === 'off' || action === 'disable') {
            setAutoReactionEnabled(ownerId, false);
            // Also update legacy for backward compatibility
            saveAutoReactionState(false);
            isAutoReactionEnabled = false;
            await sock.sendMessage(chatId, { 
                text: `✅ Auto-reactions have been *DISABLED* for YOUR session!`,
                quoted: message
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `❌ Invalid option!\n\nCurrent status: *${currentState ? 'ENABLED' : 'DISABLED'}*\n\nUsage:\n.areact on - Enable auto-reactions\n.areact off - Disable auto-reactions`,
                quoted: message
            });
        }
    } catch (error) {
        console.error('Error handling areact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error controlling auto-reactions',
            quoted: message
        });
    }
}

/**
 * Clear cache for a specific user
 * @param {string} userId - The user's JID
 */
function clearUserCache(userId) {
    reactionCache.delete(userId);
}

module.exports = {
    addCommandReaction,
    handleAreactCommand,
    isAutoReactionEnabledForUser,
    setAutoReactionEnabled,
    clearUserCache,
    getRandomEmoji,
    // Legacy exports for backward compatibility
    loadAutoReactionState,
    saveAutoReactionState
};