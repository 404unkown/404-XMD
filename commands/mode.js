const userSettings = require('../lib/userSettings');
const isOwnerOrSudo = require('../lib/isOwner');

// Cache for faster access
const modeCache = new Map();

/**
 * Check if bot is in public mode for a specific user
 * @param {string} userId - The user's JID (the session owner)
 * @returns {boolean} Whether public mode is enabled
 */
function isPublicModeForUser(userId) {
    try {
        if (!userId) return true;
        if (modeCache.has(userId)) return modeCache.get(userId);
        const settings = userSettings.getUserFeature(userId, 'mode');
        const enabled = settings.enabled !== undefined ? settings.enabled : true;
        modeCache.set(userId, enabled);
        return enabled;
    } catch (error) {
        return true;
    }
}

/**
 * Set mode state for a specific user
 * @param {string} userId - The user's JID
 * @param {boolean} enabled - New state (true = public, false = private)
 * @returns {boolean} Success status
 */
function setModeForUser(userId, enabled) {
    try {
        const result = userSettings.updateUserSetting(userId, 'mode', 'enabled', enabled);
        if (result) modeCache.set(userId, enabled);
        return result;
    } catch (error) {
        console.error('Error setting mode:', error);
        return false;
    }
}

async function modeCommand(sock, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isUserOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isUserOwner && !isOwnerSimple) {
            await sock.sendMessage(chatId, {
                text: '❌ Only the bot owner can use this command!'
            }, { quoted: message });
            return;
        }

        const sessionOwnerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const action = args[0]?.toLowerCase();
        const currentMode = isPublicModeForUser(sessionOwnerId);

        if (!action) {
            await sock.sendMessage(chatId, {
                text: `⚙️ *BOT MODE*\n\nCurrent mode: *${currentMode ? 'PUBLIC' : 'PRIVATE'}*\n\n*PUBLIC*: Everyone can use bot\n*PRIVATE*: Only owner can use bot\n\nUsage: .mode public\nUsage: .mode private`
            }, { quoted: message });
            return;
        }

        if (action !== 'public' && action !== 'private') {
            await sock.sendMessage(chatId, {
                text: `❌ Invalid mode!\n\nUsage: .mode public\nUsage: .mode private`
            }, { quoted: message });
            return;
        }

        const newMode = action === 'public';
        setModeForUser(sessionOwnerId, newMode);

        await sock.sendMessage(chatId, {
            text: `✅ Bot mode changed to *${action.toUpperCase()}* for YOUR session!`
        }, { quoted: message });

    } catch (error) {
        console.error('Mode command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing mode command!'
        }, { quoted: message });
    }
}

module.exports = {
    modeCommand,
    isPublicModeForUser,
    setModeForUser
};