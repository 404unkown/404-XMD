/**
 * 404 XMD - A WhatsApp Bot
 * Autotyping Command - Shows fake typing status (Per User)
 */

const userSettings = require('../lib/userSettings');
const isOwnerOrSudo = require('../lib/isOwner');

// Cache for faster access
const autotypingCache = new Map();

/**
 * Check if autotyping is enabled for a specific user
 * @param {string} userId - The user's JID (the session owner)
 * @returns {boolean} Whether autotyping is enabled
 */
function isAutotypingEnabled(userId) {
    try {
        if (!userId) return false;
        
        // Check cache first
        if (autotypingCache.has(userId)) {
            return autotypingCache.get(userId);
        }
        
        // Get from userSettings
        const settings = userSettings.getUserFeature(userId, 'autotyping');
        const enabled = settings.enabled || false;
        
        // Store in cache
        autotypingCache.set(userId, enabled);
        
        return enabled;
    } catch (error) {
        console.error('Error checking autotyping status:', error);
        return false;
    }
}

/**
 * Set autotyping state for a specific user
 * @param {string} userId - The user's JID
 * @param {boolean} enabled - New state
 * @returns {boolean} Success status
 */
function setAutotypingEnabled(userId, enabled) {
    try {
        const result = userSettings.updateUserSetting(userId, 'autotyping', 'enabled', enabled);
        
        if (result) {
            // Update cache
            autotypingCache.set(userId, enabled);
        }
        
        return result;
    } catch (error) {
        console.error(`Error setting autotyping for ${userId}:`, error);
        return false;
    }
}

/**
 * Migrate legacy data to new system
 */
function migrateLegacyData() {
    const fs = require('fs');
    const path = require('path');
    const LEGACY_PATH = path.join(__dirname, '..', 'data', 'autotyping.json');
    
    if (fs.existsSync(LEGACY_PATH)) {
        try {
            const legacyData = JSON.parse(fs.readFileSync(LEGACY_PATH, 'utf8'));
            
            // Legacy file was global, so we can't know which user it belonged to
            // We'll assume it was for the first user or skip migration
            console.log('⚠️ Legacy autotyping.json found but cannot migrate to per-user without user ID');
            console.log('💡 Users will need to reconfigure autotyping with .autotyping on/off');
            
            // Optionally backup and remove legacy file
            const backupPath = path.join(__dirname, '..', 'data', 'autotyping.json.backup');
            fs.renameSync(LEGACY_PATH, backupPath);
            console.log(`📦 Legacy autotyping.json backed up to ${backupPath}`);
            
        } catch (e) {
            console.error('Migration error:', e.message);
        }
    }
}

// Run migration
migrateLegacyData();

// Toggle autotyping feature
async function autotypingCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        // Get current state
        const currentState = isAutotypingEnabled(ownerId);
        
        // Toggle based on argument or toggle current state if no argument
        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'enable') {
                setAutotypingEnabled(ownerId, true);
            } else if (action === 'off' || action === 'disable') {
                setAutotypingEnabled(ownerId, false);
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ Invalid option!\n\nCurrent status: *${currentState ? 'ON' : 'OFF'}*\n\nUsage:\n.autotyping on - Enable for YOUR session\n.autotyping off - Disable for YOUR session`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: '404 XMD',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
        } else {
            // Toggle current state
            setAutotypingEnabled(ownerId, !currentState);
        }
        
        // Get new state after toggle
        const newState = isAutotypingEnabled(ownerId);
        
        // Send confirmation message
        await sock.sendMessage(chatId, {
            text: `✅ Auto-typing has been *${newState ? 'ENABLED' : 'DISABLED'}* for YOUR session!`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        });
        
    } catch (error) {
        console.error('Error in autotyping command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Function to handle autotyping for regular messages
async function handleAutotypingForMessage(sock, chatId, userMessage) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if autotyping is enabled for this specific user
        if (!isAutotypingEnabled(ownerId)) {
            return false;
        }
        
        // First subscribe to presence updates for this chat
        await sock.presenceSubscribe(chatId);
        
        // Send available status first
        await sock.sendPresenceUpdate('available', chatId);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Then send the composing status
        await sock.sendPresenceUpdate('composing', chatId);
        
        // Simulate typing time based on message length with increased minimum time
        const typingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        // Send composing again to ensure it stays visible
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Finally send paused status
        await sock.sendPresenceUpdate('paused', chatId);
        
        return true; // Indicates typing was shown
    } catch (error) {
        console.error('❌ Error sending typing indicator:', error);
        return false; // Indicates typing failed
    }
}

// Function to handle autotyping for commands - BEFORE command execution (not used anymore)
async function handleAutotypingForCommand(sock, chatId) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if autotyping is enabled for this specific user
        if (!isAutotypingEnabled(ownerId)) {
            return false;
        }
        
        // First subscribe to presence updates for this chat
        await sock.presenceSubscribe(chatId);
        
        // Send available status first
        await sock.sendPresenceUpdate('available', chatId);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Then send the composing status
        await sock.sendPresenceUpdate('composing', chatId);
        
        // Keep typing indicator active for commands with increased duration
        const commandTypingDelay = 3000;
        await new Promise(resolve => setTimeout(resolve, commandTypingDelay));
        
        // Send composing again to ensure it stays visible
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Finally send paused status
        await sock.sendPresenceUpdate('paused', chatId);
        
        return true; // Indicates typing was shown
    } catch (error) {
        console.error('❌ Error sending command typing indicator:', error);
        return false; // Indicates typing failed
    }
}

// Function to show typing status AFTER command execution
async function showTypingAfterCommand(sock, chatId) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if autotyping is enabled for this specific user
        if (!isAutotypingEnabled(ownerId)) {
            return false;
        }
        
        // This function runs after the command has been executed and response sent
        // So we just need to show a brief typing indicator
        
        // Subscribe to presence updates
        await sock.presenceSubscribe(chatId);
        
        // Show typing status briefly
        await sock.sendPresenceUpdate('composing', chatId);
        
        // Keep typing visible for a short time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Then pause
        await sock.sendPresenceUpdate('paused', chatId);
        
        return true;
    } catch (error) {
        console.error('❌ Error sending post-command typing indicator:', error);
        return false;
    }
}

/**
 * Clear cache for a specific user
 */
function clearUserCache(userId) {
    autotypingCache.delete(userId);
}

module.exports = {
    autotypingCommand,
    isAutotypingEnabled,
    setAutotypingEnabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand,
    clearUserCache
};