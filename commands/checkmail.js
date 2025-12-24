const axios = require('axios');

module.exports = async (sock, chatId, message, rawText) => {
    try {
        const args = rawText.trim().split(' ');
        const sessionId = args[1];
        
        if (!sessionId) {
            await sock.sendMessage(chatId, {
                text: "📬 *Check Temporary Email Inbox*\n\n" +
                      "Please provide your session ID\n\n" +
                      "*Usage:* .checkmail <session-id>\n" +
                      "*Example:* .checkmail abc123xyz\n" +
                      "*Aliases:* .inbox, .tmail, .mailinbox\n\n" +
                      "*Note:* Get session ID from .tempmail command"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(sessionId)}`;
        const response = await axios.get(inboxUrl, { timeout: 15000 });

        if (!response.data.success) {
            await sock.sendMessage(chatId, {
                text: "❌ Invalid session ID or email expired\n\n" +
                      "Possible reasons:\n" +
                      "1. Session ID is incorrect\n" +
                      "2. Email has expired (24 hours)\n" +
                      "3. No messages received yet\n\n" +
                      "Generate new email: .tempmail"
            }, { quoted: message });
            return;
        }

        const { inbox_count, messages } = response.data;

        if (inbox_count === 0 || !messages || messages.length === 0) {
            await sock.sendMessage(chatId, {
                text: "📭 *Your inbox is empty*\n\n" +
                      "No messages have been received yet.\n" +
                      "Give it some time and check again!\n\n" +
                      "*Session ID:* " + sessionId
            }, { quoted: message });
            
            await sock.sendMessage(chatId, { 
                react: { text: 'ℹ️', key: message.key } 
            });
            return;
        }

        // Format messages
        let messageList = `📬 *EMAIL INBOX*\n\n`;
        messageList += `*Total Messages:* ${inbox_count}\n`;
        messageList += `*Session ID:* ${sessionId}\n\n`;
        messageList += `━━━━━━━━━━━━━━━━━━\n\n`;

        messages.forEach((msg, index) => {
            // Limit message preview length
            const bodyPreview = msg.body.length > 200 
                ? msg.body.substring(0, 200) + '...' 
                : msg.body;
            
            const date = new Date(msg.date);
            const formattedDate = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            messageList += `📌 *Message ${index + 1}*\n`;
            messageList += `👤 *From:* ${msg.from || 'Unknown'}\n`;
            messageList += `📝 *Subject:* ${msg.subject || 'No Subject'}\n`;
            messageList += `⏰ *Received:* ${formattedDate}\n\n`;
            messageList += `📄 *Content:*\n${bodyPreview}\n\n`;
            messageList += `━━━━━━━━━━━━━━━━━━\n\n`;
        });

        // Add footer
        messageList += `🤖 *Powered by 404XMD*\n`;
        messageList += `🔁 Check again: .checkmail ${sessionId}`;

        // Split message if too long
        if (messageList.length > 4000) {
            const firstPart = messageList.substring(0, 4000) + '\n...\n(Message truncated)';
            const secondPart = messageList.substring(4000);
            
            await sock.sendMessage(chatId, { text: firstPart }, { quoted: message });
            if (secondPart.length > 0) {
                await sock.sendMessage(chatId, { text: secondPart });
            }
        } else {
            await sock.sendMessage(chatId, { text: messageList }, { quoted: message });
        }

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('CheckMail error:', error);
        
        let errorMsg = "❌ Failed to check inbox.";
        if (error.code === "ECONNABORTED") {
            errorMsg = "⏳ Service timeout. Please try again.";
        } else if (error.response?.status === 404) {
            errorMsg = "❌ Session not found or expired.";
        }

        await sock.sendMessage(chatId, {
            text: errorMsg + "\n\n*Usage:* .checkmail <session-id>"
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};