const axios = require('axios');

module.exports = async (sock, chatId, message, rawText) => {
    try {
        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const response = await axios.get('https://apis.davidcyriltech.my.id/temp-mail', { timeout: 15000 });
        const { email, session_id, expires_at } = response.data;

        // Format expiration time
        const expiresDate = new Date(expires_at);
        const timeString = expiresDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const dateString = expiresDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Calculate hours until expiration
        const hoursLeft = Math.floor((expiresDate - new Date()) / (1000 * 60 * 60));

        await sock.sendMessage(chatId, {
            text: `📧 *TEMPORARY EMAIL GENERATED*\n\n` +
                  `✉️ *Email Address:*\n\`${email}\`\n\n` +
                  `⏳ *Expires In:* ${hoursLeft} hours\n` +
                  `📅 *Expiry Time:* ${timeString}\n` +
                  `📆 *Expiry Date:* ${dateString}\n\n` +
                  `🔑 *Session ID:*\n\`${session_id}\`\n\n` +
                  `📥 *Check Inbox:*\n.checkmail ${session_id}\n.inbox ${session_id}\n\n` +
                  `*Note:* This email will expire in 24 hours\n\n` +
                  `🤖 *Powered by 404XMD*`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('TempMail error:', error);
        
        let errorMsg = "❌ Failed to generate temporary email.";
        if (error.code === "ECONNABORTED") {
            errorMsg = "⏳ Service timeout. Please try again.";
        } else if (error.message.includes("rate limit")) {
            errorMsg = "🚫 Rate limit exceeded. Please wait before trying again.";
        }

        await sock.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};