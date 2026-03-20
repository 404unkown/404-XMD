// /commands/autosticker.js
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const userSettings = require('../lib/userSettings');

// Base directory for user-specific sticker files (still need this for actual stickers)
const STICKER_BASE_DIR = path.join(__dirname, '..', 'data', 'autosticker_stickers');

// Ensure base sticker directory exists
async function ensureStickerBaseDirectory() {
    try {
        await fs.mkdir(STICKER_BASE_DIR, { recursive: true });
    } catch (error) {
        console.error('Error ensuring sticker base directory:', error);
    }
}

// Call once on load
ensureStickerBaseDirectory();

/**
 * Get the sticker directory for a specific user
 * @param {string} userId - The user's JID
 * @returns {string} Path to user's sticker directory
 */
function getUserStickerDir(userId) {
    const sanitizedId = userId.replace(/[^a-zA-Z0-9@._-]/g, '_');
    return path.join(STICKER_BASE_DIR, sanitizedId);
}

/**
 * Ensure user sticker directory exists
 * @param {string} userId - The user's JID
 */
async function ensureUserStickerDir(userId) {
    try {
        const stickerDir = getUserStickerDir(userId);
        await fs.mkdir(stickerDir, { recursive: true });
        return stickerDir;
    } catch (error) {
        console.error(`Error ensuring sticker dir for ${userId}:`, error);
        return null;
    }
}

/**
 * List all stickers for a specific user
 * @param {string} userId - The user's JID
 * @returns {Array} List of sticker files
 */
async function listUserStickers(userId) {
    try {
        const stickerDir = getUserStickerDir(userId);
        await ensureUserStickerDir(userId);
        
        const files = await fs.readdir(stickerDir);
        return files.filter(file => 
            file.endsWith('.webp') || 
            file.endsWith('.png') || 
            file.endsWith('.jpg') ||
            file.endsWith('.jpeg')
        );
    } catch (error) {
        return [];
    }
}

/**
 * Get triggers from userSettings
 * @param {string} userId - The user's JID
 * @returns {Object} Triggers object
 */
function getUserTriggers(userId) {
    const settings = userSettings.getUserFeature(userId, 'autosticker');
    return settings.triggers || {};
}

/**
 * Check if auto-sticker is enabled for a specific user
 * @param {string} userId - The user's JID
 * @returns {boolean} Whether auto-sticker is enabled
 */
async function isAutoStickerEnabled(userId) {
    try {
        if (!userId) return false;
        const settings = userSettings.getUserFeature(userId, 'autosticker');
        return settings.enabled === true;
    } catch (error) {
        console.error('Error checking auto-sticker status:', error);
        return false;
    }
}

/**
 * Update auto-sticker settings for a user
 * @param {string} userId - The user's JID
 * @param {Object} updates - Settings to update
 * @returns {boolean} Success status
 */
async function updateAutoStickerSettings(userId, updates) {
    try {
        const current = userSettings.getUserFeature(userId, 'autosticker');
        const newSettings = { ...current, ...updates };
        
        // Update each setting individually
        let success = true;
        for (const [key, value] of Object.entries(newSettings)) {
            const result = userSettings.updateUserSetting(userId, 'autosticker', key, value);
            if (!result) success = false;
        }
        
        return success;
    } catch (error) {
        console.error(`Error updating autosticker for ${userId}:`, error);
        return false;
    }
}

/**
 * Add a trigger for a user
 * @param {string} userId - The user's JID
 * @param {string} trigger - Trigger word
 * @param {string} stickerFile - Sticker filename
 * @returns {boolean} Success status
 */
async function addTrigger(userId, trigger, stickerFile) {
    try {
        const triggers = getUserTriggers(userId);
        triggers[trigger.toLowerCase()] = stickerFile;
        
        return await updateAutoStickerSettings(userId, { triggers });
    } catch (error) {
        console.error(`Error adding trigger for ${userId}:`, error);
        return false;
    }
}

/**
 * Remove a trigger for a user
 * @param {string} userId - The user's JID
 * @param {string} trigger - Trigger word to remove
 * @returns {boolean} Success status
 */
async function removeTrigger(userId, trigger) {
    try {
        const triggers = getUserTriggers(userId);
        delete triggers[trigger.toLowerCase()];
        
        return await updateAutoStickerSettings(userId, { triggers });
    } catch (error) {
        console.error(`Error removing trigger for ${userId}:`, error);
        return false;
    }
}

/**
 * Migrate legacy data to new system
 */
async function migrateLegacyData() {
    const LEGACY_DIR = path.join(__dirname, '..', 'data', 'autosticker');
    
    if (fsSync.existsSync(LEGACY_DIR)) {
        const users = fsSync.readdirSync(LEGACY_DIR);
        let migrated = 0;
        
        for (const userDir of users) {
            const userPath = path.join(LEGACY_DIR, userDir);
            if (fsSync.statSync(userPath).isDirectory()) {
                try {
                    // Reconstruct userId from directory name
                    const userId = userDir.replace(/_/g, '@');
                    
                    // Migrate config
                    const configPath = path.join(userPath, 'config.json');
                    if (fsSync.existsSync(configPath)) {
                        const config = JSON.parse(fsSync.readFileSync(configPath, 'utf8'));
                        
                        // Migrate to new system
                        await updateAutoStickerSettings(userId, {
                            enabled: config.enabled || false,
                            triggers: config.triggers || {}
                        });
                        
                        // Migrate sticker files
                        const oldStickerDir = path.join(userPath, 'stickers');
                        if (fsSync.existsSync(oldStickerDir)) {
                            const newStickerDir = getUserStickerDir(userId);
                            await ensureUserStickerDir(userId);
                            
                            const stickers = fsSync.readdirSync(oldStickerDir);
                            for (const sticker of stickers) {
                                const oldPath = path.join(oldStickerDir, sticker);
                                const newPath = path.join(newStickerDir, sticker);
                                fsSync.copyFileSync(oldPath, newPath);
                            }
                        }
                        
                        migrated++;
                    }
                } catch (e) {
                    console.error('Migration error for', userDir, e.message);
                }
            }
        }
        
        console.log(`✅ Migrated ${migrated} autosticker users to central system`);
    }
}

// Run migration automatically
migrateLegacyData();

// Auto-sticker command handler
async function autostickerCommand(sock, chatId, message, args = []) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Ensure sticker directory exists for this user
        await ensureUserStickerDir(ownerId);
        
        const text = message.message?.conversation?.trim() ||
                    message.message?.extendedTextMessage?.text?.trim() ||
                    '';
        
        const subcommand = args[0]?.toLowerCase();
        
        if (!subcommand) {
            // Show help
            const settings = userSettings.getUserFeature(ownerId, 'autosticker');
            const status = settings.enabled ? '✅ ON' : '❌ OFF';
            
            const helpText = `
╭─❖ *🎭 YOUR AUTO-STICKER MANAGER* ❖─
│
├─ *Your Status:* ${status}
│
├─ *Usage:* .autosticker <command>
│
├─ *Commands:*
│  ├─ .autosticker on/off
│  ├─ .autosticker list
│  ├─ .autosticker add <text> <sticker>
│  ├─ .autosticker remove <text>
│  ├─ .autosticker upload
│  └─ .autosticker info
│
├─ *Examples:*
│  ├─ .autosticker on
│  ├─ .autosticker list
│  ├─ .autosticker add hi hi.webp
│  ├─ .autosticker remove hi
│  └─ .autosticker upload (reply to sticker)
│
╰─➤ _These settings only affect YOUR session_
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: helpText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }
        
        switch (subcommand) {
            case 'on':
            case 'enable':
                {
                    // Enable auto-sticker for this user
                    await updateAutoStickerSettings(ownerId, { enabled: true });
                    
                    await sock.sendMessage(chatId, {
                        text: '*✅ Auto-sticker enabled for YOUR session*\nBot will now automatically send stickers for your configured keywords.',
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                }
                break;
                
            case 'off':
            case 'disable':
                {
                    // Disable auto-sticker for this user
                    await updateAutoStickerSettings(ownerId, { enabled: false });
                    
                    await sock.sendMessage(chatId, {
                        text: '*✅ Auto-sticker disabled for YOUR session*\nBot will no longer send automatic stickers in your session.',
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                }
                break;
                
            case 'list':
                {
                    // List all configured triggers for this user
                    const triggers = getUserTriggers(ownerId);
                    const stickers = await listUserStickers(ownerId);
                    
                    if (Object.keys(triggers).length === 0) {
                        await sock.sendMessage(chatId, {
                            text: '*📝 No auto-stickers configured for your session*\nUse `.autosticker add` to add triggers.',
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true
                            }
                        }, { quoted: message });
                        return;
                    }
                    
                    let listText = '╭─❖ *🎭 YOUR AUTO-STICKER LIST* ❖─\n│\n';
                    
                    for (const [trigger, stickerFile] of Object.entries(triggers)) {
                        const stickerPath = path.join(getUserStickerDir(ownerId), stickerFile);
                        const exists = fsSync.existsSync(stickerPath);
                        const status = exists ? '✅' : '❌';
                        listText += `├─ ${status} *"${trigger}"* → ${stickerFile}\n`;
                    }
                    
                    listText += `│\n├─ *Your triggers:* ${Object.keys(triggers).length}\n`;
                    listText += `├─ *Your stickers:* ${stickers.length}\n`;
                    listText += `╰─➤ _Use .autosticker add to add more_`;
                    
                    await sock.sendMessage(chatId, {
                        text: listText,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                }
                break;
                
            case 'add':
                {
                    // Add new trigger for this user
                    if (args.length < 3) {
                        await sock.sendMessage(chatId, {
                            text: '*❌ Usage:* .autosticker add <text> <sticker-file>\n\n*Example:* .autosticker add hello hello.webp',
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true
                            }
                        }, { quoted: message });
                        return;
                    }
                    
                    const trigger = args[1].toLowerCase();
                    const stickerFile = args[2];
                    
                    // Check if sticker file exists in user's sticker directory
                    const stickerPath = path.join(getUserStickerDir(ownerId), stickerFile);
                    if (!fsSync.existsSync(stickerPath)) {
                        // List available stickers for this user
                        const availableStickers = await listUserStickers(ownerId);
                        
                        let errorText = `*❌ Sticker not found in your collection*\nFile "${stickerFile}" not found.\n\n*Your available stickers:*\n`;
                        
                        if (availableStickers.length === 0) {
                            errorText += `├─ No stickers yet\n`;
                        } else {
                            availableStickers.forEach(file => {
                                errorText += `├─ ${file}\n`;
                            });
                        }
                        errorText += `╰─➤ _Use .autosticker upload to add stickers to your collection_`;
                        
                        await sock.sendMessage(chatId, {
                            text: errorText,
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true
                            }
                        }, { quoted: message });
                        return;
                    }
                    
                    // Add to user's triggers
                    await addTrigger(ownerId, trigger, stickerFile);
                    
                    await sock.sendMessage(chatId, {
                        text: `*✅ Trigger added to YOUR session*\n\n*Trigger:* "${trigger}"\n*Sticker:* ${stickerFile}\n\nNow when someone says "${trigger}" in your session, the bot will automatically send ${stickerFile}`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                }
                break;
                
            case 'remove':
            case 'delete':
                {
                    // Remove trigger for this user
                    if (args.length < 2) {
                        await sock.sendMessage(chatId, {
                            text: '*❌ Usage:* .autosticker remove <text>\n\n*Example:* .autosticker remove hello',
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true
                            }
                        }, { quoted: message });
                        return;
                    }
                    
                    const triggerToRemove = args[1].toLowerCase();
                    const triggers = getUserTriggers(ownerId);
                    
                    if (!triggers[triggerToRemove]) {
                        await sock.sendMessage(chatId, {
                            text: `*❌ Trigger not found in your session*\n"${triggerToRemove}" is not configured.`,
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true
                            }
                        }, { quoted: message });
                        return;
                    }
                    
                    await removeTrigger(ownerId, triggerToRemove);
                    
                    await sock.sendMessage(chatId, {
                        text: `*✅ Trigger removed from your session*\n"${triggerToRemove}" has been removed from your auto-sticker triggers.`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                }
                break;
                
            case 'upload':
                {
                    // Upload sticker to user's autosticker directory
                    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    
                    if (!quotedMsg?.stickerMessage) {
                        await sock.sendMessage(chatId, {
                            text: '*❌ Please reply to a sticker*\n\n*Usage:* Reply to a sticker with `.autosticker upload`\n\nThe sticker will be saved to YOUR personal sticker collection.',
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true
                            }
                        }, { quoted: message });
                        return;
                    }
                    
                    // Download the sticker
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    
                    await sock.sendMessage(chatId, {
                        text: '*⬇️ Downloading sticker to your collection...*',
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                    
                    try {
                        const stream = await downloadContentFromMessage(quotedMsg.stickerMessage, 'sticker');
                        const chunks = [];
                        for await (const chunk of stream) {
                            chunks.push(chunk);
                        }
                        const stickerBuffer = Buffer.concat(chunks);
                        
                        // Generate filename
                        const timestamp = Date.now();
                        const filename = `sticker_${timestamp}.webp`;
                        const stickerDir = getUserStickerDir(ownerId);
                        await ensureUserStickerDir(ownerId);
                        const filepath = path.join(stickerDir, filename);
                        
                        // Save sticker to user's directory
                        await fs.writeFile(filepath, stickerBuffer);
                        
                        await sock.sendMessage(chatId, {
                            text: `*✅ Sticker added to YOUR collection*\n\n*Filename:* ${filename}\n*Size:* ${(stickerBuffer.length / 1024).toFixed(2)}KB\n\nNow you can use:\n\`.autosticker add <text> ${filename}\`\n\nExample:\n\`.autosticker add hello ${filename}\``,
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true
                            }
                        }, { quoted: message });
                        
                    } catch (error) {
                        console.error('Sticker upload error:', error);
                        await sock.sendMessage(chatId, {
                            text: `*❌ Failed to upload sticker*\nError: ${error.message}`,
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true
                            }
                        }, { quoted: message });
                    }
                }
                break;
                
            case 'info':
            case 'status':
                {
                    // Show status info for this user
                    const settings = userSettings.getUserFeature(ownerId, 'autosticker');
                    const stickers = await listUserStickers(ownerId);
                    const triggers = settings.triggers || {};
                    const isEnabled = settings.enabled === true;
                    
                    const infoText = `
╭─❖ *🎭 YOUR AUTO-STICKER STATUS* ❖─
│
├─ *Status:* ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
├─ *Your triggers:* ${Object.keys(triggers).length}
├─ *Your stickers:* ${stickers.length}
├─ *Your sticker dir:* data/autosticker_stickers/${ownerId.replace(/[^a-zA-Z0-9@._-]/g, '_')}/
│
├─ *Usage:*
│  ├─ .autosticker on/off - Toggle for your session
│  ├─ .autosticker list - View your triggers
│  └─ .autosticker upload - Add stickers to your collection
│
╰─➤ _These settings only affect YOUR session_
                    `.trim();
                    
                    await sock.sendMessage(chatId, {
                        text: infoText,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                }
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: '*❌ Unknown subcommand*\nUse `.autosticker` to see available commands.',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Autosticker command error:', error);
        await sock.sendMessage(chatId, {
            text: `*❌ Error:* ${error.message}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: message });
    }
}

// Function to check and send auto-stickers
async function checkAutoSticker(sock, chatId, message, text) {
    try {
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if auto-sticker is enabled for this specific user
        const isEnabled = await isAutoStickerEnabled(ownerId);
        if (!isEnabled) {
            return false;
        }
        
        // Get user's triggers
        const triggers = getUserTriggers(ownerId);
        const normalizedText = text.toLowerCase().trim();
        
        // Check for exact matches
        if (triggers[normalizedText]) {
            const stickerFile = triggers[normalizedText];
            const stickerPath = path.join(getUserStickerDir(ownerId), stickerFile);
            
            if (fsSync.existsSync(stickerPath)) {
                const stickerBuffer = fsSync.readFileSync(stickerPath);
                
                await sock.sendMessage(chatId, {
                    sticker: stickerBuffer,
                    packname: global.packname || 'Auto-Sticker',
                    author: global.author || 'Bot'
                }, { quoted: message });
                
                return true;
            }
        }
        
        // Check for partial matches (if text contains trigger)
        for (const [trigger, stickerFile] of Object.entries(triggers)) {
            if (normalizedText.includes(trigger.toLowerCase())) {
                const stickerPath = path.join(getUserStickerDir(ownerId), stickerFile);
                
                if (fsSync.existsSync(stickerPath)) {
                    const stickerBuffer = fsSync.readFileSync(stickerPath);
                    
                    await sock.sendMessage(chatId, {
                        sticker: stickerBuffer,
                        packname: global.packname || 'Auto-Sticker',
                        author: global.author || 'Bot'
                    }, { quoted: message });
                    
                    return true;
                }
            }
        }
        
        return false;
        
    } catch (error) {
        console.error('Auto-sticker check error:', error);
        return false;
    }
}

module.exports = {
    autostickerCommand,
    checkAutoSticker,
    isAutoStickerEnabled
};