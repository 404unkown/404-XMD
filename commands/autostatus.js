const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: '404 XMD',
            serverMessageId: -1
        }
    }
};

// Base directory for user-specific configs
const DATA_DIR = path.join(__dirname, '../data/autostatus');

// Ensure base directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Get the config path for a specific user
 * @param {string} userId - The user's JID
 * @returns {string} Path to user's config file
 */
function getUserConfigPath(userId) {
    // Sanitize userId to create a valid filename
    const sanitizedId = userId.replace(/[^a-zA-Z0-9@._-]/g, '_');
    return path.join(DATA_DIR, `${sanitizedId}.json`);
}

/**
 * Initialize configuration for a specific user
 * @param {string} userId - The user's JID
 * @returns {Object} User's config object
 */
function initUserConfig(userId) {
    const configPath = getUserConfigPath(userId);
    
    if (!fs.existsSync(configPath)) {
        const defaultConfig = { 
            enabled: false, 
            reactOn: false,
            lastUpdated: Date.now()
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    
    try {
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        console.error(`Error reading autostatus config for ${userId}:`, error);
        const defaultConfig = { 
            enabled: false, 
            reactOn: false,
            lastUpdated: Date.now()
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
}

/**
 * Save configuration for a specific user
 * @param {string} userId - The user's JID
 * @param {Object} config - User's config object
 */
function saveUserConfig(userId, config) {
    try {
        const configPath = getUserConfigPath(userId);
        config.lastUpdated = Date.now();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error(`Error saving autostatus config for ${userId}:`, error);
    }
}

/**
 * Check if auto status is enabled for a specific user
 * @param {string} userId - The user's JID (the session owner)
 * @returns {boolean} Whether auto status is enabled
 */
function isAutoStatusEnabled(userId) {
    try {
        if (!userId) return false;
        const config = initUserConfig(userId);
        return config.enabled === true;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

/**
 * Check if status reactions are enabled for a specific user
 * @param {string} userId - The user's JID (the session owner)
 * @returns {boolean} Whether status reactions are enabled
 */
function isStatusReactionEnabled(userId) {
    try {
        if (!userId) return false;
        const config = initUserConfig(userId);
        return config.reactOn === true;
    } catch (error) {
        console.error('Error checking status reaction config:', error);
        return false;
    }
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        // Only the session owner can control their own auto-status
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used by the owner of this session!',
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Read current user config
        let config = initUserConfig(ownerId);

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? 'enabled' : 'disabled';
            const reactStatus = config.reactOn ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, { 
                text: `🔄 *Your Auto Status Settings*\n\n` +
                      `📱 *Auto Status View:* ${status}\n` +
                      `💫 *Status Reactions:* ${reactStatus}\n\n` +
                      `*Commands:*\n` +
                      `.autostatus on - Enable auto status view\n` +
                      `.autostatus off - Disable auto status view\n` +
                      `.autostatus react on - Enable status reactions\n` +
                      `.autostatus react off - Disable status reactions\n\n` +
                      `*Note:* This only affects your session.`,
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        // Handle on/off commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.enabled = true;
            saveUserConfig(ownerId, config);
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto Status View Enabled For Your Session*\n\nBot will now automatically view all contact statuses in YOUR session.',
                ...channelInfo
            }, { quoted: msg });
        } else if (command === 'off') {
            config.enabled = false;
            saveUserConfig(ownerId, config);
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto Status View Disabled For Your Session*\n\nBot will no longer automatically view statuses in your session.',
                ...channelInfo
            }, { quoted: msg });
        } else if (command === 'react') {
            // Handle react subcommand
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please specify on/off for reactions!\nUse: .autostatus react on/off',
                    ...channelInfo
                }, { quoted: msg });
                return;
            }
            
            const reactCommand = args[1].toLowerCase();
            if (reactCommand === 'on') {
                config.reactOn = true;
                saveUserConfig(ownerId, config);
                await sock.sendMessage(chatId, { 
                    text: '💫 *Status Reactions Enabled For Your Session*\n\nBot will now react to status updates in YOUR session.',
                    ...channelInfo
                }, { quoted: msg });
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                saveUserConfig(ownerId, config);
                await sock.sendMessage(chatId, { 
                    text: '❌ *Status Reactions Disabled For Your Session*\n\nBot will no longer react to status updates in your session.',
                    ...channelInfo
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '❌ Invalid reaction command! Use: .autostatus react on/off',
                    ...channelInfo
                }, { quoted: msg });
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid command! Use:\n.autostatus on/off - Enable/disable auto status view\n.autostatus react on/off - Enable/disable status reactions',
                ...channelInfo
            }, { quoted: msg });
        }

    } catch (error) {
        console.error('Error in autostatus command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while managing auto status!\n' + error.message,
            ...channelInfo
        }, { quoted: msg });
    }
}

// Function to react to status using proper method
async function reactToStatus(sock, statusKey) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if reactions are enabled for this specific user
        if (!isStatusReactionEnabled(ownerId)) {
            return;
        }

        // Use the proper relayMessage method for status reactions
        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
        
        // Removed success log - only keep errors
    } catch (error) {
        console.error('❌ Error reacting to status:', error.message);
    }
}

// Function to handle status updates
async function handleStatusUpdate(sock, status) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if auto status is enabled for this specific user
        if (!isAutoStatusEnabled(ownerId)) {
            return;
        }

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Handle status from messages.upsert
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    
                    // React to status if enabled for this user
                    await reactToStatus(sock, msg.key);
                    
                    // Removed success log - only keep errors
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Rate limit hit, waiting before retrying...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }

        // Handle direct status updates
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                
                // React to status if enabled for this user
                await reactToStatus(sock, status.key);
                
                // Removed success log - only keep errors
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

        // Handle status in reactions
        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                
                // React to status if enabled for this user
                await reactToStatus(sock, status.reaction.key);
                
                // Removed success log - only keep errors
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};