/**
 * 404 XMD - A WhatsApp Bot
 * Autoreply Command - Auto-reply to private messages when enabled
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autoreply.json');

// Default autoreply message
const DEFAULT_MESSAGE = "Hello! I'm currently away. I'll get back to you soon.";

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        const defaultConfig = {
            enabled: false,
            message: DEFAULT_MESSAGE,
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

        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        // Initialize or read config
        const config = initConfig();
        
        // Check current status if no arguments
        if (args.length === 0) {
            const status = config.enabled ? '🟢 ON' : '🔴 OFF';
            await sock.sendMessage(chatId, {
                text: `📝 *Autoreply Settings*\n\nStatus: ${status}\nMessage: ${config.message}\n\n*Usage:*\n.autoreply on [message] - Enable with custom message\n.autoreply off - Disable\n.autoreply - Check status`,
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
            // Enable autoreply
            config.enabled = true;
            
            // Check if there's a custom message
            const customMessage = args.slice(1).join(' ');
            if (customMessage.trim()) {
                config.message = customMessage;
            }
            
            saveConfig(config);
            
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
            
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid option! Use:\n.autoreply on [message]\n.autoreply off\n.autoreply',
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
        console.error('Error in autoreply command:', error);
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
        
        // Get the autoreply message
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