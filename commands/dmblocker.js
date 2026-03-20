const userSettings = require('../lib/userSettings');
const isOwnerOrSudo = require('../lib/isOwner');

// Default message
const DEFAULT_MESSAGE = '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.';

// Cache for faster access
const dmBlockerCache = new Map();

/**
 * Check if dmblocker is enabled for a specific user
 * @param {string} userId - The user's JID
 * @returns {boolean} Whether dmblocker is enabled
 */
function isDmBlockerEnabled(userId) {
    try {
        if (!userId) return false;
        
        // Check cache first
        if (dmBlockerCache.has(userId)) {
            return dmBlockerCache.get(userId).enabled;
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'dmblocker');
        
        // Store in cache
        dmBlockerCache.set(userId, {
            enabled: settings.enabled || false,
            message: settings.message || DEFAULT_MESSAGE
        });
        
        return settings.enabled === true;
    } catch (error) {
        console.error('Error checking dmblocker status:', error);
        return false;
    }
}

/**
 * Get dmblocker message for a specific user
 * @param {string} userId - The user's JID
 * @returns {string} Warning message
 */
function getDmBlockerMessage(userId) {
    try {
        // Check cache first
        if (dmBlockerCache.has(userId)) {
            return dmBlockerCache.get(userId).message;
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'dmblocker');
        const message = settings.message || DEFAULT_MESSAGE;
        
        // Store in cache
        dmBlockerCache.set(userId, {
            enabled: settings.enabled || false,
            message: message
        });
        
        return message;
    } catch (error) {
        console.error('Error getting dmblocker message:', error);
        return DEFAULT_MESSAGE;
    }
}

/**
 * Update dmblocker settings for a user
 * @param {string} userId - The user's JID
 * @param {Object} updates - Settings to update
 * @returns {boolean} Success status
 */
function updateDmBlockerSettings(userId, updates) {
    try {
        const current = userSettings.getUserFeature(userId, 'dmblocker');
        const newSettings = { ...current, ...updates };
        
        // Update each setting individually
        let success = true;
        for (const [key, value] of Object.entries(newSettings)) {
            const result = userSettings.updateUserSetting(userId, 'dmblocker', key, value);
            if (!result) success = false;
        }
        
        // Update cache
        dmBlockerCache.set(userId, newSettings);
        
        return success;
    } catch (error) {
        console.error(`Error updating dmblocker for ${userId}:`, error);
        return false;
    }
}

/**
 * Migrate legacy data to new system
 */
function migrateLegacyData() {
    const fs = require('fs');
    const path = require('path');
    const LEGACY_DIR = path.join(__dirname, '..', 'data', 'dmblocker');
    
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
                    updateDmBlockerSettings(userId, {
                        enabled: legacyData.enabled || false,
                        message: legacyData.message || DEFAULT_MESSAGE
                    });
                    migrated++;
                } catch (e) {
                    console.error('Migration error for', file, e.message);
                }
            }
        }
        
        console.log(`✅ Migrated ${migrated} dmblocker settings to central system`);
    }
}

// Run migration
migrateLegacyData();

/**
 * Clear cache for a specific user
 */
function clearUserCache(userId) {
    dmBlockerCache.delete(userId);
}

async function dmblockerCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Only the session owner can control their own dmblocker
        if (senderId !== ownerId && !message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only the owner of this bot session can use this command!\n\nEach user has their own DM blocker settings.' 
            }, { quoted: message });
            return;
        }
        
        // Get current settings
        const currentEnabled = isDmBlockerEnabled(ownerId);
        const currentMessage = getDmBlockerMessage(ownerId);
        
        const argStr = (args || '').trim();
        const [sub, ...rest] = argStr.split(' ');
        
        if (!sub || !['on', 'off', 'status', 'setmsg'].includes(sub.toLowerCase())) {
            await sock.sendMessage(chatId, { 
                text: `*📵 DM Blocker (Your Session)*\n\n` +
                      `*Your Status:* ${currentEnabled ? '✅ ON' : '❌ OFF'}\n` +
                      `*Your Message:* ${currentMessage}\n\n` +
                      `*Commands:*\n` +
                      `• .dmblocker on - Enable for YOUR session\n` +
                      `• .dmblocker off - Disable for YOUR session\n` +
                      `• .dmblocker status - Show your status\n` +
                      `• .dmblocker setmsg <text> - Set YOUR warning message\n\n` +
                      `*Note:* This only affects YOUR session.`
            }, { quoted: message });
            return;
        }

        const cmd = sub.toLowerCase();

        if (cmd === 'status') {
            await sock.sendMessage(chatId, { 
                text: `📵 *Your DM Blocker Status*\n\n` +
                      `Status: ${currentEnabled ? '✅ ON' : '❌ OFF'}\n` +
                      `Message: ${currentMessage}` 
            }, { quoted: message });
            return;
        }

        if (cmd === 'setmsg') {
            const newMsg = rest.join(' ').trim();
            if (!newMsg) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Usage: .dmblocker setmsg <message>\n\nExample: .dmblocker setmsg Please contact me in groups only.' 
                }, { quoted: message });
                return;
            }
            updateDmBlockerSettings(ownerId, { message: newMsg });
            await sock.sendMessage(chatId, { 
                text: `✅ *Your DM Blocker message updated!*\n\nNew message: ${newMsg}` 
            }, { quoted: message });
            return;
        }

        if (cmd === 'on' || cmd === 'off') {
            const enable = cmd === 'on';
            updateDmBlockerSettings(ownerId, { enabled: enable });
            await sock.sendMessage(chatId, { 
                text: `✅ *DM Blocker ${enable ? 'ENABLED' : 'DISABLED'} for YOUR session!*\n\n` +
                      `Users DMing your bot will ${enable ? 'be blocked' : 'not be blocked'}.` 
            }, { quoted: message });
            return;
        }

    } catch (error) {
        console.error('Error in dmblocker command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error processing command!' 
        }, { quoted: message });
    }
}

module.exports = { 
    dmblockerCommand, 
    isDmBlockerEnabled,
    getDmBlockerMessage,
    clearUserCache
};