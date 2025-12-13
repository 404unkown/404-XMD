/**
 * 404 XMD - A WhatsApp Bot
 * Autovoice Command - Auto-reply with voice notes to private messages
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autovoice.json');
// Path to store voice notes
const voiceNotesDir = path.join(__dirname, '..', 'data', 'autovoice_notes');

// Create voice notes directory if it doesn't exist
if (!fs.existsSync(voiceNotesDir)) {
    fs.mkdirSync(voiceNotesDir, { recursive: true });
}

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        const defaultConfig = {
            enabled: false,
            voiceNotePath: null, // Path to voice note file
            lastUpdated: Date.now()
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Save configuration
function saveConfig(config) {
    config.lastUpdated = Date.now();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Save uploaded voice note
async function saveVoiceNote(sock, message, userId) {
    try {
        // Download the voice note/audio
        const buffer = await downloadMediaMessage(
            message,
            'buffer',
            {},
            { 
                logger: console,
                reuploadRequest: sock.updateMediaMessage 
            }
        );
        
        const filename = `autovoice_${userId}_${Date.now()}.opus`;
        const filepath = path.join(voiceNotesDir, filename);
        
        fs.writeFileSync(filepath, buffer);
        
        // Delete old voice note if exists
        const config = initConfig();
        if (config.voiceNotePath && fs.existsSync(config.voiceNotePath)) {
            fs.unlinkSync(config.voiceNotePath);
        }
        
        return filepath;
    } catch (error) {
        console.error('Error saving voice note:', error);
        throw error;
    }
}

// Check if message has voice note or audio
function hasVoiceNote(message) {
    return (
        message.message?.audioMessage ||
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage
    );
}

// Autovoice command handler
async function autovoiceCommand(sock, chatId, message) {
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

        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        // Check if user is sending a voice note with the command
        const isVoiceUpload = hasVoiceNote(message) && 
                             (message.message?.conversation?.includes('.autovoice') || 
                              message.message?.extendedTextMessage?.text?.includes('.autovoice'));
        
        // Initialize or read config
        const config = initConfig();
        
        // Handle voice note upload
        if (isVoiceUpload) {
            try {
                // Save the voice note
                const voicePath = await saveVoiceNote(sock, message, senderId.split('@')[0]);
                config.voiceNotePath = voicePath;
                config.enabled = true; // Auto-enable when voice is set
                saveConfig(config);
                
                await sock.sendMessage(chatId, {
                    text: '✅ *Voice Note Set & Autovoice Enabled!*\n\nYour voice note has been saved. I will now auto-reply with this voice note to private messages.',
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
            } catch (error) {
                console.error('Error saving voice note:', error);
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to save voice note! Make sure you sent a proper voice/audio message.',
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
        }
        
        // Check current status if no arguments
        if (args.length === 0) {
            const status = config.enabled ? '🟢 ON' : '🔴 OFF';
            const voiceStatus = config.voiceNotePath ? '✅ Set' : '❌ Not Set';
            
            await sock.sendMessage(chatId, {
                text: `🎤 *Autovoice Settings*\n\nStatus: ${status}\nVoice Note: ${voiceStatus}\n\n*Usage:*\n\`.autovoice on\` - Enable autovoice reply\n\`.autovoice off\` - Disable autovoice\nSend a voice note with caption \`.autovoice\` to set voice\n\`.autovoice\` - Check status`,
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
        
        const action = args[0].toLowerCase();
        
        if (action === 'on') {
            // Enable autovoice
            if (!config.voiceNotePath) {
                await sock.sendMessage(chatId, {
                    text: '❌ No voice note set! Send a voice note with caption `.autovoice` first.',
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
            
            config.enabled = true;
            saveConfig(config);
            
            await sock.sendMessage(chatId, {
                text: '✅ *Autovoice Enabled!*\n\nI will now auto-reply with voice notes to private messages.',
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
            
        } else if (action === 'off') {
            // Disable autovoice
            config.enabled = false;
            saveConfig(config);
            
            await sock.sendMessage(chatId, {
                text: '❌ *Autovoice Disabled*\n\nI will no longer auto-reply with voice notes.',
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
            
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid option! Use:\n`.autovoice on`\n`.autovoice off`\nSend voice note with `.autovoice`\n`.autovoice`',
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
        
    } catch (error) {
        console.error('Error in autovoice command:', error);
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

// Function to check if autovoice is enabled
function isAutovoiceEnabled() {
    try {
        const config = initConfig();
        return config.enabled && config.voiceNotePath;
    } catch (error) {
        console.error('Error checking autovoice status:', error);
        return false;
    }
}

// Function to get voice note buffer
function getVoiceNoteBuffer() {
    try {
        const config = initConfig();
        if (!config.voiceNotePath || !fs.existsSync(config.voiceNotePath)) {
            return null;
        }
        return fs.readFileSync(config.voiceNotePath);
    } catch (error) {
        console.error('Error getting voice note:', error);
        return null;
    }
}

// Handle autovoice reply for private messages
async function handleAutovoice(sock, chatId, senderId, userMessage, message) {
    try {
        // Only respond in private chats (not groups)
        if (chatId.endsWith('@g.us')) return false;
        
        // Don't respond to bot's own messages
        if (message.key.fromMe) return false;
        
        // Don't respond to commands
        if (userMessage.startsWith('.')) return false;
        
        // Check if autovoice is enabled
        if (!isAutovoiceEnabled()) return false;
        
        // Check if the sender is owner/sudo (don't autoreply to them)
        const { isSudo } = require('../lib/index');
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        const senderIsSudo = await isSudo(senderId);
        
        if (isOwner || senderIsSudo) return false;
        
        // Skip if message is too short or empty
        if (!userMessage.trim() || userMessage.trim().length < 1) return false;
        
        // Add a small delay to simulate human response
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get the voice note buffer
        const voiceBuffer = getVoiceNoteBuffer();
        if (!voiceBuffer) {
            console.error('Voice note not found!');
            return false;
        }
        
        // Send voice note reply
        await sock.sendMessage(chatId, {
            audio: voiceBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true, // This makes it a voice note
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                },
                mentionedJid: [senderId]
            }
        });
        
        console.log(`🎤 Autovoice reply sent to ${senderId}`);
        return true;
        
    } catch (error) {
        console.error('Error in handleAutovoice:', error);
        return false;
    }
}

// Cleanup old voice notes (optional)
function cleanupVoiceNotes(maxAge = 30 * 24 * 60 * 60 * 1000) {
    try {
        const files = fs.readdirSync(voiceNotesDir);
        const now = Date.now();
        
        files.forEach(file => {
            const filepath = path.join(voiceNotesDir, file);
            const stats = fs.statSync(filepath);
            
            if (now - stats.mtimeMs > maxAge) {
                fs.unlinkSync(filepath);
                console.log(`Cleaned up old autovoice note: ${file}`);
            }
        });
    } catch (error) {
        console.error('Error cleaning up voice notes:', error);
    }
}

module.exports = {
    autovoiceCommand,
    isAutovoiceEnabled,
    getVoiceNoteBuffer,
    handleAutovoice,
    cleanupVoiceNotes
};