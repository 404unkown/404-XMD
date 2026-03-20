const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

const messageStore = new Map(); // Still global since it stores messages by ID
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp');

// Base directory for user-specific configs
const CONFIG_DIR = path.join(__dirname, '../data/antidelete');

// Ensure directories exist
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}
if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Function to get folder size in MB
const getFolderSizeInMB = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        let totalSize = 0;

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                totalSize += fs.statSync(filePath).size;
            }
        }

        return totalSize / (1024 * 1024); // Convert bytes to MB
    } catch (err) {
        console.error('Error getting folder size:', err);
        return 0;
    }
};

// Function to clean temp folder if size exceeds 200MB
const cleanTempFolderIfLarge = () => {
    try {
        const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);
        
        if (sizeMB > 200) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            for (const file of files) {
                const filePath = path.join(TEMP_MEDIA_DIR, file);
                fs.unlinkSync(filePath);
            }
            console.log('🧹 Temp folder cleaned (exceeded 200MB)');
        }
    } catch (err) {
        console.error('Temp cleanup error:', err);
    }
};

// Start periodic cleanup check every 1 minute
setInterval(cleanTempFolderIfLarge, 60 * 1000);

/**
 * Get the config path for a specific user
 * @param {string} userId - The user's JID
 * @returns {string} Path to user's config file
 */
function getUserConfigPath(userId) {
    // Sanitize userId to create a valid filename
    const sanitizedId = userId.replace(/[^a-zA-Z0-9@._-]/g, '_');
    return path.join(CONFIG_DIR, `${sanitizedId}.json`);
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
            lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    
    try {
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        console.error(`Error reading antidelete config for ${userId}:`, error);
        const defaultConfig = { enabled: false };
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
        config.lastUpdated = new Date().toISOString();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error(`Error saving antidelete config for ${userId}:`, error);
    }
}

/**
 * Check if antidelete is enabled for a specific user (session owner)
 * @param {string} userId - The user's JID
 * @returns {boolean} Whether antidelete is enabled
 */
function isAntideleteEnabled(userId) {
    try {
        if (!userId) return false;
        const config = initUserConfig(userId);
        return config.enabled === true;
    } catch (error) {
        console.error('Error checking antidelete status:', error);
        return false;
    }
}

const isOwnerOrSudo = require('../lib/isOwner');

// Command Handler - Now per-user
async function handleAntideleteCommand(sock, chatId, message, match) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        // Only the session owner can toggle their own antidelete
        if (!message.key.fromMe && !isOwner) {
            return sock.sendMessage(chatId, { 
                text: '*❌ Only the owner of this session can use this command.*' 
            }, { quoted: message });
        }

        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Initialize or read user-specific config
        const config = initUserConfig(ownerId);

        if (!match) {
            return sock.sendMessage(chatId, {
                text: `*ANTIDELETE SETUP*\n\n` +
                      `*Your Status:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n\n` +
                      `*.antidelete on* - Enable for your session\n` +
                      `*.antidelete off* - Disable for your session`
            }, { quoted: message });
        }

        if (match === 'on') {
            config.enabled = true;
        } else if (match === 'off') {
            config.enabled = false;
        } else {
            return sock.sendMessage(chatId, { 
                text: '*❌ Invalid command. Use .antidelete to see usage.*' 
            }, { quoted: message });
        }

        // Save user-specific config
        saveUserConfig(ownerId, config);
        
        return sock.sendMessage(chatId, { 
            text: `*✅ Antidelete ${match === 'on' ? 'enabled' : 'disabled'} for your session*` 
        }, { quoted: message });

    } catch (error) {
        console.error('Error in handleAntideleteCommand:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!'
        }, { quoted: message });
    }
}

// Store incoming messages - Now checks per-user config
async function storeMessage(sock, message) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if antidelete is enabled for this specific user
        if (!isAntideleteEnabled(ownerId)) {
            return; // Don't store if this user has antidelete disabled
        }

        if (!message.key?.id) return;

        const messageId = message.key.id;
        let content = '';
        let mediaType = '';
        let mediaPath = '';
        let isViewOnce = false;

        const sender = message.key.participant || message.key.remoteJid;

        // Detect content (including view-once wrappers)
        const viewOnceContainer = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;
        if (viewOnceContainer) {
            // unwrap view-once content
            if (viewOnceContainer.imageMessage) {
                mediaType = 'image';
                content = viewOnceContainer.imageMessage.caption || '';
                const buffer = await downloadContentFromMessage(viewOnceContainer.imageMessage, 'image');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                await writeFile(mediaPath, buffer);
                isViewOnce = true;
            } else if (viewOnceContainer.videoMessage) {
                mediaType = 'video';
                content = viewOnceContainer.videoMessage.caption || '';
                const buffer = await downloadContentFromMessage(viewOnceContainer.videoMessage, 'video');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                await writeFile(mediaPath, buffer);
                isViewOnce = true;
            }
        } else if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage) {
            mediaType = 'image';
            content = message.message.imageMessage.caption || '';
            const buffer = await downloadContentFromMessage(message.message.imageMessage, 'image');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.stickerMessage) {
            mediaType = 'sticker';
            const buffer = await downloadContentFromMessage(message.message.stickerMessage, 'sticker');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.videoMessage) {
            mediaType = 'video';
            content = message.message.videoMessage.caption || '';
            const buffer = await downloadContentFromMessage(message.message.videoMessage, 'video');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.audioMessage) {
            mediaType = 'audio';
            const mime = message.message.audioMessage.mimetype || '';
            const ext = mime.includes('mpeg') ? 'mp3' : (mime.includes('ogg') ? 'ogg' : 'mp3');
            const buffer = await downloadContentFromMessage(message.message.audioMessage, 'audio');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
            await writeFile(mediaPath, buffer);
        }

        // Store the message with user info
        messageStore.set(messageId, {
            content,
            mediaType,
            mediaPath,
            sender,
            ownerId, // Store which user this message belongs to
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: new Date().toISOString()
        });

        // Anti-ViewOnce: forward immediately to owner if captured
        if (isViewOnce && mediaType && fs.existsSync(mediaPath)) {
            try {
                const senderName = sender.split('@')[0];
                const mediaOptions = {
                    caption: `*🔒 Anti-ViewOnce ${mediaType}*\nFrom: @${senderName}`,
                    mentions: [sender]
                };
                if (mediaType === 'image') {
                    await sock.sendMessage(ownerId, { image: { url: mediaPath }, ...mediaOptions });
                } else if (mediaType === 'video') {
                    await sock.sendMessage(ownerId, { video: { url: mediaPath }, ...mediaOptions });
                }
                // Cleanup immediately for view-once forward
                try { fs.unlinkSync(mediaPath); } catch {}
            } catch (e) {
                console.error('Anti-ViewOnce forward error:', e);
            }
        }

    } catch (err) {
        console.error('storeMessage error:', err);
    }
}

// Handle message deletion - Now checks per-user config
async function handleMessageRevocation(sock, revocationMessage) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if antidelete is enabled for this specific user
        if (!isAntideleteEnabled(ownerId)) {
            return; // Don't process if this user has antidelete disabled
        }

        const messageId = revocationMessage.message.protocolMessage.key.id;
        const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;

        // Don't report if deleted by the owner themselves
        if (deletedBy.includes(sock.user.id) || deletedBy === ownerId) return;

        const original = messageStore.get(messageId);
        if (!original) return;

        // Only process if this message belongs to this user's session
        if (original.ownerId !== ownerId) return;

        const sender = original.sender;
        const senderName = sender.split('@')[0];
        const groupName = original.group ? (await sock.groupMetadata(original.group)).subject : '';

        const time = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        let text = `*🔰 ANTIDELETE REPORT 🔰*\n\n` +
            `*🗑️ Deleted By:* @${deletedBy.split('@')[0]}\n` +
            `*👤 Sender:* @${senderName}\n` +
            `*📱 Number:* ${sender}\n` +
            `*🕒 Time:* ${time}\n`;

        if (groupName) text += `*👥 Group:* ${groupName}\n`;

        if (original.content) {
            text += `\n*💬 Deleted Message:*\n${original.content}`;
        }

        await sock.sendMessage(ownerId, {
            text,
            mentions: [deletedBy, sender]
        });

        // Media sending
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOptions = {
                caption: `*🖼️ Deleted ${original.mediaType}*\nFrom: @${senderName}`,
                mentions: [sender]
            };

            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(ownerId, {
                            image: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'sticker':
                        await sock.sendMessage(ownerId, {
                            sticker: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'video':
                        await sock.sendMessage(ownerId, {
                            video: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'audio':
                        await sock.sendMessage(ownerId, {
                            audio: { url: original.mediaPath },
                            mimetype: 'audio/mpeg',
                            ptt: false,
                            ...mediaOptions
                        });
                        break;
                }
            } catch (err) {
                await sock.sendMessage(ownerId, {
                    text: `⚠️ Error sending media: ${err.message}`
                });
            }

            // Cleanup
            try {
                fs.unlinkSync(original.mediaPath);
            } catch (err) {
                console.error('Media cleanup error:', err);
            }
        }

        messageStore.delete(messageId);

    } catch (err) {
        console.error('handleMessageRevocation error:', err);
    }
}

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};