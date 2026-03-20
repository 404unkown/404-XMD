const fs = require('fs');
const path = require('path');

async function clearCommand(sock, chatId, message) {
    try {
        // Check if it's a group
        const isGroup = chatId.endsWith('@g.us');
        
        // Send initial notification
        const notification = await sock.sendMessage(chatId, { 
            text: '🗑️ *Clearing messages...*' 
        }, { quoted: message });
        
        let deletedCount = 0;
        const maxMessages = 100; // Limit to prevent API rate limits
        
        try {
            // Fetch recent messages
            const messageHistory = await sock.loadMessages(chatId, maxMessages);
            
            // Delete messages in reverse order (newest to oldest)
            for (let i = messageHistory.length - 1; i >= 0; i--) {
                const msg = messageHistory[i];
                
                // Only delete messages that the bot can delete
                if (msg.key.fromMe || 
                    (isGroup && await isBotAdmin(sock, chatId)) || 
                    !isGroup) {
                    
                    try {
                        await sock.sendMessage(chatId, { delete: msg.key });
                        deletedCount++;
                        
                        // Small delay to avoid rate limiting
                        if (deletedCount % 10 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    } catch (deleteError) {
                        // Ignore errors for specific messages
                    }
                }
            }
        } catch (loadError) {
            console.log("Could not load message history:", loadError.message);
        }
        
        // Update notification with results
        await sock.sendMessage(chatId, { delete: notification.key });
        
        if (deletedCount > 0) {
            await sock.sendMessage(chatId, { 
                text: `✅ *Cleared ${deletedCount} messages*\n\n📝 *Note:* I can only delete messages I sent or messages in groups where I'm admin.`,
                quoted: message 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ *No messages cleared*\n\nI need admin permissions in groups to delete others' messages.`,
                quoted: message 
            });
        }
        
    } catch (error) {
        console.error('Error in clear command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error clearing messages.',
            quoted: message 
        });
    }
}

// Helper function to check if bot is admin (for groups)
async function isBotAdmin(sock, chatId) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botParticipant = groupMetadata.participants.find(p => p.id === botId);
        return botParticipant && botParticipant.admin;
    } catch (error) {
        console.error("Error checking bot admin status:", error);
        return false;
    }
}

// Alternative: Clear only bot's messages (more reliable)
async function clearBotMessagesCommand(sock, chatId, message) {
    try {
        const notification = await sock.sendMessage(chatId, { 
            text: '🗑️ *Clearing my messages...*' 
        }, { quoted: message });
        
        let deletedCount = 0;
        const maxMessages = 200;
        
        try {
            const messageHistory = await sock.loadMessages(chatId, maxMessages);
            
            for (let i = messageHistory.length - 1; i >= 0; i--) {
                const msg = messageHistory[i];
                
                // Only delete messages sent by the bot
                if (msg.key.fromMe) {
                    try {
                        await sock.sendMessage(chatId, { delete: msg.key });
                        deletedCount++;
                        
                        if (deletedCount % 20 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 300));
                        }
                    } catch (error) {
                        // Continue with other messages
                    }
                }
            }
        } catch (loadError) {
            console.log("Could not load messages:", loadError.message);
        }
        
        await sock.sendMessage(chatId, { delete: notification.key });
        
        await sock.sendMessage(chatId, { 
            text: `✅ *Cleared ${deletedCount} of my messages*`,
            quoted: message 
        });
        
    } catch (error) {
        console.error('Error clearing bot messages:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error clearing messages.',
            quoted: message 
        });
    }
}

module.exports = { 
    clearCommand, 
    clearBotMessagesCommand 
};