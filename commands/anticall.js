const userSettings = require('../lib/userSettings');

// Cache for faster access (reduces disk reads)
const anticallCache = new Map();

/**
 * Check if anticall is enabled for a specific user
 * Uses cache for performance, falls back to userSettings
 */
function isAnticallEnabled(userId) {
    try {
        // Check cache first
        if (anticallCache.has(userId)) {
            return anticallCache.get(userId);
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'anticall');
        const enabled = settings.enabled || false;
        
        // Store in cache
        anticallCache.set(userId, enabled);
        
        return enabled;
    } catch (error) {
        console.error(`Error checking anticall for ${userId}:`, error);
        return false;
    }
}

/**
 * Set anticall state for a specific user
 */
function setAnticallEnabled(userId, enabled) {
    try {
        const result = userSettings.updateUserSetting(userId, 'anticall', 'enabled', enabled);
        
        if (result) {
            // Update cache
            anticallCache.set(userId, enabled);
        }
        
        return result;
    } catch (error) {
        console.error(`Error setting anticall for ${userId}:`, error);
        return false;
    }
}

/**
 * Migrate legacy data to new system (optional - run once)
 */
function migrateLegacyData() {
    const fs = require('fs');
    const path = require('path');
    const LEGACY_DIR = path.join(__dirname, '../data/anticall');
    
    if (fs.existsSync(LEGACY_DIR)) {
        const files = fs.readdirSync(LEGACY_DIR);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const userId = file.replace('.json', '').replace(/_/g, '@');
                    const legacyPath = path.join(LEGACY_DIR, file);
                    const legacyData = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
                    
                    // Migrate to new system
                    setAnticallEnabled(userId, legacyData.enabled || false);
                    console.log(`Migrated anticall data for ${userId}`);
                } catch (e) {
                    console.error('Migration error:', e.message);
                }
            }
        });
    }
}

// Optional: Run migration on load (comment out if not needed)
// migrateLegacyData();

/**
 * Anticall command handler
 */
async function anticallCommand(sock, chatId, message, args) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Check if the command sender is the owner of this session
        if (senderId !== ownerId && !message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner of this bot session!' 
            }, { quoted: message });
            return;
        }

        const enabled = isAnticallEnabled(ownerId);
        const sub = (args || '').trim().toLowerCase();

        if (!sub || (sub !== 'on' && sub !== 'off' && sub !== 'status')) {
            await sock.sendMessage(chatId, { 
                text: '*📞 ANTICALL (Your Session)*\n\n' +
                      '• *.anticall on*  - Enable auto-block on incoming calls\n' +
                      '• *.anticall off* - Disable anticall\n' +
                      '• *.anticall status* - Show current status\n\n' +
                      `Current status: *${enabled ? 'ON' : 'OFF'}*` 
            }, { quoted: message });
            return;
        }

        if (sub === 'status') {
            await sock.sendMessage(chatId, { 
                text: `📞 Anticall is currently *${enabled ? 'ON' : 'OFF'}* for your session.` 
            }, { quoted: message });
            return;
        }

        const newState = sub === 'on';
        setAnticallEnabled(ownerId, newState);
        
        await sock.sendMessage(chatId, { 
            text: `✅ Anticall is now *${newState ? 'ENABLED' : 'DISABLED'}* for your session.` 
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in anticall command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error processing anticall command!' 
        }, { quoted: message });
    }
}

/**
 * Clear cache for a user (useful when settings change externally)
 */
function clearUserCache(userId) {
    anticallCache.delete(userId);
}

/**
 * Clear entire cache (useful for testing)
 */
function clearAllCache() {
    anticallCache.clear();
}

module.exports = { 
    anticallCommand, 
    isAnticallEnabled,
    setAnticallEnabled,
    clearUserCache,
    clearAllCache
};