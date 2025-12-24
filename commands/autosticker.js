// /commands/autosticker.js
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Paths
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'autosticker.json');
const STICKER_DIR = path.join(__dirname, '..', 'autos', 'autosticker');

// Ensure directories exist
async function ensureDirectories() {
    try {
        await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
        await fs.mkdir(STICKER_DIR, { recursive: true });
        
        // Create default config if doesn't exist
        if (!fsSync.existsSync(CONFIG_PATH)) {
            await fs.writeFile(CONFIG_PATH, JSON.stringify({
                "hi": "hi.webp",
                "hello": "hello.webp",
                "good morning": "morning.webp",
                "good night": "night.webp"
            }, null, 2));
        }
    } catch (error) {
        console.error('Error ensuring directories:', error);
    }
}

// Read config
async function readConfig() {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        await ensureDirectories();
        return {};
    }
}

// Write config
async function writeConfig(config) {
    try {
        await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing config:', error);
        return false;
    }
}

// List all stickers
async function listStickers() {
    try {
        const files = await fs.readdir(STICKER_DIR);
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

// Auto-sticker command handler
async function autostickerCommand(sock, chatId, message, args = []) {
    try {
        await ensureDirectories();
        
        const text = message.message?.conversation?.trim() ||
                    message.message?.extendedTextMessage?.text?.trim() ||
                    '';
        
        const subcommand = args[0]?.toLowerCase();
        
        if (!subcommand) {
            // Show help
            const helpText = `
╭─❖ *🎭 AUTO-STICKER MANAGER* ❖─
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
╰─➤ _Automatically send stickers for keywords_
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
                // Enable auto-sticker globally
                const settings = require('../settings');
                settings.AUTO_STICKER = 'true';
                
                // You might want to save this to a config file
                await sock.sendMessage(chatId, {
                    text: '*✅ Auto-sticker enabled*\nBot will now automatically send stickers for configured keywords.',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                break;
                
            case 'off':
            case 'disable':
                // Disable auto-sticker
                const settings2 = require('../settings');
                settings2.AUTO_STICKER = 'false';
                
                await sock.sendMessage(chatId, {
                    text: '*✅ Auto-sticker disabled*\nBot will no longer send automatic stickers.',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                break;
                
            case 'list':
                // List all configured triggers
                const config = await readConfig();
                const stickers = await listStickers();
                
                if (Object.keys(config).length === 0) {
                    await sock.sendMessage(chatId, {
                        text: '*📝 No auto-stickers configured*\nUse `.autosticker add` to add triggers.',
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                    return;
                }
                
                let listText = '╭─❖ *🎭 AUTO-STICKER LIST* ❖─\n│\n';
                
                Object.entries(config).forEach(([trigger, stickerFile], index) => {
                    const exists = fsSync.existsSync(path.join(STICKER_DIR, stickerFile));
                    const status = exists ? '✅' : '❌';
                    listText += `├─ ${status} *"${trigger}"* → ${stickerFile}\n`;
                });
                
                listText += `│\n├─ *Total triggers:* ${Object.keys(config).length}\n`;
                listText += `├─ *Available stickers:* ${stickers.length}\n`;
                listText += `╰─➤ _Use .autosticker add to add more_`;
                
                await sock.sendMessage(chatId, {
                    text: listText,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                break;
                
            case 'add':
                // Add new trigger
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
                
                // Check if sticker file exists
                const stickerPath = path.join(STICKER_DIR, stickerFile);
                if (!fsSync.existsSync(stickerPath)) {
                    // List available stickers
                    const availableStickers = await listStickers();
                    
                    let errorText = `*❌ Sticker not found*\nFile "${stickerFile}" not found in sticker directory.\n\n*Available stickers:*\n`;
                    availableStickers.forEach(file => {
                        errorText += `├─ ${file}\n`;
                    });
                    errorText += `╰─➤ _Use .autosticker upload to add stickers_`;
                    
                    await sock.sendMessage(chatId, {
                        text: errorText,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                    return;
                }
                
                // Add to config
                const currentConfig = await readConfig();
                currentConfig[trigger] = stickerFile;
                await writeConfig(currentConfig);
                
                await sock.sendMessage(chatId, {
                    text: `*✅ Trigger added*\n\n*Trigger:* "${trigger}"\n*Sticker:* ${stickerFile}\n\nNow when someone says "${trigger}", the bot will automatically send ${stickerFile}`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                break;
                
            case 'remove':
            case 'delete':
                // Remove trigger
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
                const configToUpdate = await readConfig();
                
                if (!configToUpdate[triggerToRemove]) {
                    await sock.sendMessage(chatId, {
                        text: `*❌ Trigger not found*\n"${triggerToRemove}" is not configured.`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                    return;
                }
                
                delete configToUpdate[triggerToRemove];
                await writeConfig(configToUpdate);
                
                await sock.sendMessage(chatId, {
                    text: `*✅ Trigger removed*\n"${triggerToRemove}" has been removed from auto-sticker triggers.`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                break;
                
            case 'upload':
                // Upload sticker to autosticker directory
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                
                if (!quotedMsg?.stickerMessage) {
                    await sock.sendMessage(chatId, {
                        text: '*❌ Please reply to a sticker*\n\n*Usage:* Reply to a sticker with `.autosticker upload`\n\nThe sticker will be saved for auto-sticker triggers.',
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
                    text: '*⬇️ Downloading sticker...*',
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
                    const filepath = path.join(STICKER_DIR, filename);
                    
                    // Save sticker
                    await fs.writeFile(filepath, stickerBuffer);
                    
                    await sock.sendMessage(chatId, {
                        text: `*✅ Sticker uploaded*\n\n*Filename:* ${filename}\n*Size:* ${(stickerBuffer.length / 1024).toFixed(2)}KB\n\nNow you can use:\n\`.autosticker add <text> ${filename}\`\n\nExample:\n\`.autosticker add hello ${filename}\``,
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
                break;
                
            case 'info':
            case 'status':
                // Show status info
                const currentConfigInfo = await readConfig();
                const stickerFiles = await listStickers();
                const settingsInfo = require('../settings');
                const isEnabled = settingsInfo.AUTO_STICKER === 'true';
                
                const infoText = `
╭─❖ *🎭 AUTO-STICKER STATUS* ❖─
│
├─ *Status:* ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
├─ *Triggers configured:* ${Object.keys(currentConfigInfo).length}
├─ *Stickers available:* ${stickerFiles.length}
├─ *Config file:* autosticker.json
├─ *Sticker folder:* autos/autosticker/
│
├─ *Usage statistics:*
│  ├─ Most used trigger: ${Object.keys(currentConfigInfo)[0] || 'None'}
│  ├─ Total triggers fired: 0
│  └─ Last updated: Just now
│
╰─➤ _Use .autosticker on/off to toggle_
                `.trim();
                
                await sock.sendMessage(chatId, {
                    text: infoText,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
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
        const settings = require('../settings');
        
        // Check if auto-sticker is enabled
        if (settings.AUTO_STICKER !== 'true') {
            return false;
        }
        
        // Read config
        const config = await readConfig();
        const normalizedText = text.toLowerCase().trim();
        
        // Check for exact matches
        if (config[normalizedText]) {
            const stickerFile = config[normalizedText];
            const stickerPath = path.join(STICKER_DIR, stickerFile);
            
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
        for (const [trigger, stickerFile] of Object.entries(config)) {
            if (normalizedText.includes(trigger.toLowerCase())) {
                const stickerPath = path.join(STICKER_DIR, stickerFile);
                
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
    checkAutoSticker
};