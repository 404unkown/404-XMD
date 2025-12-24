/**
 * 404 XMD - A WhatsApp Bot
 * Autoreply Command - Auto-reply to private messages when enabled
 * Now with voice note support!
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autoreply.json');
// Path to store voice notes
const voiceNotesDir = path.join(__dirname, '..', 'data', 'autoreply_voices');

// Create voice notes directory if it doesn't exist
if (!fs.existsSync(voiceNotesDir)) {
    fs.mkdirSync(voiceNotesDir, { recursive: true });
}

// Default autoreply message
const DEFAULT_MESSAGE = "Hello! I'm currently away. I'll get back to you soon.";

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        const defaultConfig = {
            enabled: false,
            message: DEFAULT_MESSAGE,
            voiceNotePath: null, // Path to voice note file
            useVoiceNote: false, // Whether to use voice note or text
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
        console.log('🎤 Starting voice note download...');
        
        // Debug: Check what we're trying to download
        console.log('🎤 Message type:', message._isReplyToVoiceNote ? 'Reply to voice note' : 'Direct voice note');
        console.log('🎤 Has audio?', !!message.message?.audioMessage);
        
        if (!message.message?.audioMessage) {
            throw new Error('No audio message found to download');
        }
        
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
        
        if (!buffer || buffer.length === 0) {
            throw new Error('Downloaded buffer is empty (0 bytes)');
        }
        
        console.log(`🎤 Downloaded ${buffer.length} bytes`);
        
        const filename = `autoreply_voice_${userId}_${Date.now()}.opus`;
        const filepath = path.join(voiceNotesDir, filename);
        
        fs.writeFileSync(filepath, buffer);
        console.log(`🎤 Saved voice note to: ${filepath}`);
        
        // Delete old voice note if exists
        const config = initConfig();
        if (config.voiceNotePath && fs.existsSync(config.voiceNotePath)) {
            fs.unlinkSync(config.voiceNotePath);
            console.log('🗑️ Deleted old voice note');
        }
        
        return filepath;
    } catch (error) {
        console.error('❌ Error saving voice note:', error);
        throw error;
    }
}

// Check if message has voice note or audio
function hasVoiceNote(message) {
    return (
        message.message?.audioMessage ||
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
        message._isVoiceNote || // Check for flag from main.js
        message._isReplyToVoiceNote || // Check for reply flag
        (message.message?.videoMessage && message.message.videoMessage.ptt) // Push-to-talk video (voice notes)
    );
}

// Get voice note buffer
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

// Autoreply command handler
async function autoreplyCommand(sock, chatId, message) {
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

        // Debug logging
        console.log('🔍 [AUTOREPLY HANDLER]');
        console.log('🔍 Voice note flag?', !!message._isVoiceNote);
        console.log('🔍 Reply to voice note?', !!message._isReplyToVoiceNote);
        console.log('🔍 Voice on command?', !!message._isVoiceOnCommand);
        console.log('🔍 Has audio?', !!message.message?.audioMessage);
        console.log('🔍 Has quoted audio?', !!message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage);

        // Get command text
        let commandText = message._originalCommand || '';
        
        // Get command arguments
        const args = commandText.trim().split(' ').slice(1) || [];
        
        // Initialize or read config
        const config = initConfig();
        
        // Check if we need to save a voice note
        // This happens in 3 cases:
        // 1. Voice note with caption .autoreply
        // 2. Reply to voice note with .autoreply voice on
        // 3. Any voice note when using .autoreply voice on
        const shouldSaveVoiceNote = (
            // Case 1: Voice note with .autoreply
            (message._isVoiceNote && commandText.includes('.autoreply')) ||
            // Case 2: Reply to voice note with voice on command
            (message._isReplyToVoiceNote && message._isVoiceOnCommand) ||
            // Case 3: Any voice note when args contain "voice on"
            (message._isVoiceNote && args.includes('voice') && args[args.indexOf('voice') + 1] === 'on')
        );
        
        console.log('🔍 Should save voice note?', shouldSaveVoiceNote);
        
        // Handle voice note save if needed
        if (shouldSaveVoiceNote) {
            try {
                console.log('💾 Saving voice note...');
                let messageToSave = message;
                
                // If replying to voice note, we need to extract the quoted message
                if (message._isReplyToVoiceNote) {
                    console.log('💾 Extracting quoted voice note...');
                    // Create a new message object with the quoted audio
                    messageToSave = {
                        ...message,
                        message: {
                            audioMessage: message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage
                        },
                        key: {
                            ...message.key,
                            id: message.message?.extendedTextMessage?.contextInfo?.stanzaId || message.key.id
                        }
                    };
                }
                
                // Save the voice note
                const voicePath = await saveVoiceNote(sock, messageToSave, senderId.split('@')[0]);
                config.voiceNotePath = voicePath;
                config.useVoiceNote = true;
                config.enabled = true;
                saveConfig(config);
                
                await sock.sendMessage(chatId, {
                    text: '✅ *Voice Note Saved & Autoreply Enabled!*\n\nYour voice note has been saved. I will now auto-reply with this voice note to private messages.',
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
                console.error('❌ Error saving voice note:', error);
                console.error('❌ Error details:', error.message);
                console.error('❌ Error stack:', error.stack);
                
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to save voice note!\n\nMake sure:\n1. You are replying to a voice note\n2. The voice note is not corrupted\n3. Try sending the voice note first, then use `.autoreply voice on` as a separate message.',
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
        if (args.length === 0 && !commandText.includes('voice') && !commandText.includes('on') && !commandText.includes('off')) {
            const status = config.enabled ? '🟢 ON' : '🔴 OFF';
            const replyMode = config.useVoiceNote && config.voiceNotePath ? '🎤 Voice Note' : '📝 Text';
            
            let statusMessage = `📝 *Autoreply Settings*\n\nStatus: ${status}\nMode: ${replyMode}`;
            
            if (config.useVoiceNote && config.voiceNotePath) {
                statusMessage += `\nVoice Note: ✅ Set`;
            } else {
                statusMessage += `\nMessage: ${config.message}`;
            }
            
            statusMessage += `\n\n*Usage:*\n\`.autoreply on [message]\` - Enable with custom message\n\`.autoreply off\` - Disable\n\`.autoreply voice on\` - Enable voice note mode\n\`.autoreply voice off\` - Disable voice note mode\nSend a voice note with caption \`.autoreply\` to set voice\n\`.autoreply\` - Check status`;
            
            await sock.sendMessage(chatId, {
                text: statusMessage,
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
        
        const action = args[0]?.toLowerCase() || '';
        const subAction = args[1] ? args[1].toLowerCase() : '';
        
        if (action === 'on') {
            // Enable autoreply
            config.enabled = true;
            
            // Check if it's voice mode
            if (subAction === 'voice') {
                if (!config.voiceNotePath) {
                    // Check if we're currently in a voice note that we can save
                    if (message._isVoiceNote || message._isReplyToVoiceNote) {
                        try {
                            console.log('💾 Saving current/replied voice note for voice mode...');
                            let messageToSave = message;
                            
                            if (message._isReplyToVoiceNote) {
                                messageToSave = {
                                    ...message,
                                    message: {
                                        audioMessage: message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage
                                    }
                                };
                            }
                            
                            const voicePath = await saveVoiceNote(sock, messageToSave, senderId.split('@')[0]);
                            config.voiceNotePath = voicePath;
                        } catch (error) {
                            console.error('❌ Failed to save voice note:', error);
                            await sock.sendMessage(chatId, {
                                text: '❌ No voice note set! Send a voice note with caption `.autoreply` first.\n\nOr:\n1. Send a voice note (any message)\n2. Then send `.autoreply voice on`',
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
                        await sock.sendMessage(chatId, {
                            text: '❌ No voice note set! Send a voice note with caption `.autoreply` first.\n\nOr:\n1. Send a voice note (any message)\n2. Then send `.autoreply voice on`',
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
                config.useVoiceNote = true;
            } else {
                // Text mode
                config.useVoiceNote = false;
                
                // Check if there's a custom message
                const customMessage = args.slice(1).join(' ');
                if (customMessage.trim()) {
                    config.message = customMessage;
                }
            }
            
            saveConfig(config);
            
            if (config.useVoiceNote) {
                await sock.sendMessage(chatId, {
                    text: '✅ *Autoreply Enabled (Voice Mode)*\n\nI will now auto-reply with voice notes to private messages.',
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
                    text: `✅ *Autoreply Enabled*\n\nMessage: ${config.message}\n\nI will now auto-reply to private messages (except commands and owner/sudo).`,
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
            
        } else if (action === 'off') {
            // Disable autoreply
            config.enabled = false;
            saveConfig(config);
            
            await sock.sendMessage(chatId, {
                text: '❌ *Autoreply Disabled*\n\nI will no longer auto-reply to private messages.',
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
            
        } else if (action === 'voice') {
            if (subAction === 'on') {
                // Check if we have a recent voice note to use
                let voicePath = config.voiceNotePath;
                
                // If no voice note is saved, try to use the current message if it's a voice note
                if (!voicePath && (message._isVoiceNote || message._isReplyToVoiceNote)) {
                    try {
                        console.log('🎤 Using current/replied voice note for voice mode...');
                        let messageToSave = message;
                        
                        if (message._isReplyToVoiceNote) {
                            messageToSave = {
                                ...message,
                                message: {
                                    audioMessage: message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage
                                }
                            };
                        }
                        
                        voicePath = await saveVoiceNote(sock, messageToSave, senderId.split('@')[0]);
                    } catch (error) {
                        console.error('❌ Failed to save current voice note:', error);
                    }
                }
                
                if (!voicePath) {
                    await sock.sendMessage(chatId, {
                        text: '❌ No voice note set! Send a voice note with caption `.autoreply` first.\n\nOr:\n1. Send a voice note (any message)\n2. Then send `.autoreply voice on`',
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
                
                config.voiceNotePath = voicePath;
                config.useVoiceNote = true;
                config.enabled = true;
                saveConfig(config);
                
                await sock.sendMessage(chatId, {
                    text: '✅ *Voice Note Mode Enabled*\n\nI will now reply with your voice note.',
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
                
            } else if (subAction === 'off') {
                config.useVoiceNote = false;
                saveConfig(config);
                
                await sock.sendMessage(chatId, {
                    text: '✅ *Voice Note Mode Disabled*\n\nSwitched back to text mode.',
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
                    text: '❌ Invalid voice command! Use:\n`.autoreply voice on`\n`.autoreply voice off`',
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
            
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid command! Use:\n`.autoreply on [message]`\n`.autoreply off`\n`.autoreply voice on/off`\nSend voice note with `.autoreply`\n`.autoreply`',
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
        console.error('❌ Error in autoreply command:', error);
        console.error('❌ Error stack:', error.stack);
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

// Function to check if autoreply is enabled
function isAutoreplyEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autoreply status:', error);
        return false;
    }
}

// Function to check if voice note mode is enabled
function isVoiceNoteMode() {
    try {
        const config = initConfig();
        return config.enabled && config.useVoiceNote && config.voiceNotePath;
    } catch (error) {
        console.error('Error checking voice note mode:', error);
        return false;
    }
}

// Function to get autoreply message
function getAutoreplyMessage() {
    try {
        const config = initConfig();
        return config.message;
    } catch (error) {
        console.error('Error getting autoreply message:', error);
        return DEFAULT_MESSAGE;
    }
}

// Handle autoreply for private messages
async function handleAutoreply(sock, chatId, senderId, userMessage, message) {
    try {
        // Only respond in private chats (not groups)
        if (chatId.endsWith('@g.us')) return false;
        
        // Don't respond to bot's own messages
        if (message.key.fromMe) return false;
        
        // Don't respond to commands
        if (userMessage.startsWith('.')) return false;
        
        // Check if autoreply is enabled
        if (!isAutoreplyEnabled()) return false;
        
        // Check if the sender is owner/sudo (don't autoreply to them)
        const { isSudo } = require('../lib/index');
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        const senderIsSudo = await isSudo(senderId);
        
        if (isOwner || senderIsSudo) return false;
        
        // Skip if message is too short or empty
        if (!userMessage.trim() || userMessage.trim().length < 1) return false;
        
        // Add a small delay to simulate human response
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if voice note mode is enabled
        if (isVoiceNoteMode()) {
            const voiceBuffer = getVoiceNoteBuffer();
            if (voiceBuffer) {
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
                
                console.log(`🎤 Voice note autoreply sent to ${senderId}`);
                return true;
            } else {
                console.log('Voice note not found, falling back to text');
                // Fall back to text mode
            }
        }
        
        // Get the autoreply message (text mode)
        const replyMessage = getAutoreplyMessage();
        
        // Send autoreply message
        await sock.sendMessage(chatId, {
            text: replyMessage,
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
        
        console.log(`📩 Autoreply sent to ${senderId}: ${replyMessage.substring(0, 50)}...`);
        return true;
        
    } catch (error) {
        console.error('Error in handleAutoreply:', error);
        return false;
    }
}

module.exports = {
    autoreplyCommand,
    isAutoreplyEnabled,
    getAutoreplyMessage,
    handleAutoreply
};