const fs = require('fs');
const path = require('path');

// File to store auto-reply state for private chats
const STATE_FILE = './data/autoreply_state.json';

// Default state
let autoReplyEnabled = false;
let autoReplyMessage = "I'm currently unavailable. I'll get back to you soon!";

// Load saved state
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            autoReplyEnabled = data.enabled || false;
            autoReplyMessage = data.message || "I'm currently unavailable. I'll get back to you soon!";
            console.log(`✅ Auto-reply state loaded: ${autoReplyEnabled ? 'ON' : 'OFF'}`);
        }
    } catch (error) {
        console.error('❌ Error loading auto-reply state:', error);
        // Create default state file
        saveState();
    }
}

// Save state to file
function saveState() {
    try {
        const dir = path.dirname(STATE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const state = {
            enabled: autoReplyEnabled,
            message: autoReplyMessage,
            lastUpdated: new Date().toISOString()
        };
        
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        console.log(`💾 Auto-reply state saved: ${autoReplyEnabled ? 'ON' : 'OFF'}`);
    } catch (error) {
        console.error('❌ Error saving auto-reply state:', error);
    }
}

// Initialize on require
loadState();

// Main command handler
async function autoreplyCommand(sock, chatId, args, message) {
    const isOwner = message.key.fromMe || await require('../lib/isOwner')(message.key.participant || message.key.remoteJid, sock, chatId);
    
    if (!isOwner) {
        await sock.sendMessage(chatId, { 
            text: '❌ This command is only available for the owner!' 
        }, { quoted: message });
        return;
    }
    
    if (args.length < 1) {
        await sock.sendMessage(chatId, { 
            text: `🤖 *Auto-Reply Settings*\n\nStatus: ${autoReplyEnabled ? '✅ ON' : '❌ OFF'}\nMessage: "${autoReplyMessage}"\n\n*Commands:*\n.auto reply on - Enable auto-reply in private chats\n.auto reply off - Disable auto-reply\n.auto reply message <text> - Set custom message\n.auto reply status - Show current settings\n\n*Note:* Works only in private chats (one-on-one), not in groups.`
        }, { quoted: message });
        return;
    }
    
    console.log('🔍 Auto-reply args received:', args);
    
    // If first arg is "reply", skip it
    let actualArgs = args;
    if (args[0] && args[0].toLowerCase() === 'reply') {
        actualArgs = args.slice(1);
    }
    
    const subCommand = actualArgs[0].toLowerCase();
    
    switch (subCommand) {
        case 'on':
            autoReplyEnabled = true;
            saveState();
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto-reply has been turned ON*\nI will now automatically reply to messages in your private chats.\n\nBot will respond when someone messages you directly (not in groups).'
            }, { quoted: message });
            break;
            
        case 'off':
            autoReplyEnabled = false;
            saveState();
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto-reply has been turned OFF*\nI will no longer auto-reply to private messages.'
            }, { quoted: message });
            break;
            
        case 'message':
            const newMessage = actualArgs.slice(1).join(' ');
            if (!newMessage.trim()) {
                await sock.sendMessage(chatId, { 
                    text: '📝 Please provide a message. Example:\n.auto reply message I\'m busy right now, please leave a message.'
                }, { quoted: message });
                return;
            }
            autoReplyMessage = newMessage;
            saveState();
            await sock.sendMessage(chatId, { 
                text: `✅ *Auto-reply message updated:*\n"${newMessage}"`
            }, { quoted: message });
            break;
            
        case 'status':
            await sock.sendMessage(chatId, { 
                text: `📊 *Auto-Reply Status*\n\nStatus: ${autoReplyEnabled ? '✅ ON' : '❌ OFF'}\nMessage: "${autoReplyMessage}"\n\nLast updated: ${new Date().toLocaleString()}\n\n*Note:* Only works in private chats`
            }, { quoted: message });
            break;
            
        default:
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid sub-command. Use:\n.auto reply on/off\n.auto reply message <text>\n.auto reply status'
            }, { quoted: message });
    }
}

// Function to check and send auto-reply in private chats
async function handleAutoReply(sock, message) {
    try {
        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Check if it's a private chat (not a group)
        const isGroup = chatId.endsWith('@g.us');
        if (isGroup) {
            return; // Don't auto-reply in groups
        }
        
        // Don't reply if auto-reply is disabled
        if (!autoReplyEnabled) return;
        
        // Don't reply to bot's own messages
        if (message.key.fromMe) return;
        
        // Extract user message
        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.audioMessage?.caption?.trim() ||
            ''
        );
        
        // Don't reply to commands (messages starting with .)
        if (userMessage.startsWith('.')) return;
        
        // Don't reply to empty messages (only media without caption)
        if (!userMessage && (!message.message?.imageMessage && !message.message?.videoMessage && !message.message?.audioMessage)) {
            return;
        }
        
        // Optional: Add cooldown to prevent spam
        const COOLDOWN_FILE = './data/autoreply_cooldown.json';
        let cooldownData = {};
        
        try {
            if (fs.existsSync(COOLDOWN_FILE)) {
                cooldownData = JSON.parse(fs.readFileSync(COOLDOWN_FILE, 'utf8'));
            }
        } catch (error) {
            cooldownData = {};
        }
        
        const now = Date.now();
        const lastReply = cooldownData[senderId] || 0;
        const COOLDOWN_MS = 60000; // 1 minute cooldown per user
        
        if (now - lastReply < COOLDOWN_MS) {
            return; // Still in cooldown
        }
        
        // Update cooldown
        cooldownData[senderId] = now;
        try {
            const dir = path.dirname(COOLDOWN_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(cooldownData, null, 2));
        } catch (error) {
            console.error('❌ Error saving cooldown:', error);
        }
        
        // Show typing indicator (optional)
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await sock.sendPresenceUpdate('paused', chatId);
        
        // Send the auto-reply with your identity
        await sock.sendMessage(chatId, { 
            text: autoReplyMessage,
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
        
        // Log the auto-reply
        console.log(`🤖 Auto-reply sent to ${senderId} in private chat`);
        
    } catch (error) {
        console.error('❌ Error in handleAutoReply:', error);
    }
}

// Export functions
module.exports = {
    autoreplyCommand,
    handleAutoReply,
    isAutoreplyEnabled: () => autoReplyEnabled,
    getAutoreplyMessage: () => autoReplyMessage,
    loadState // Export for manual reloading if needed
};