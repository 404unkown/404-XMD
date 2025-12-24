const axios = require("axios");

module.exports = async (sock, chatId, message, rawText) => {
    try {
        const args = rawText.trim().split(' ');
        const phoneNumber = args[1];
        
        if (!phoneNumber) {
            await sock.sendMessage(chatId, {
                text: "❌ *Usage:* .otpbox <full-number>\n\n*Example:* .otpbox +1234567890\n.otpbox +923103448100\n\n*Note:* Include country code (+) and full number"
            }, { quoted: message });
            return;
        }

        // Validate phone number format
        if (!phoneNumber.startsWith('+')) {
            await sock.sendMessage(chatId, {
                text: "❌ Phone number must start with '+' (include country code)\n\n*Example:* .otpbox +1234567890"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const apiUrl = `https://api.vreden.my.id/api/tools/fakenumber/message?nomor=${encodeURIComponent(phoneNumber)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });

        if (!data?.result || !Array.isArray(data.result) || data.result.length === 0) {
            await sock.sendMessage(chatId, {
                text: `📭 No OTP messages found for *${phoneNumber}*\n\nPossible reasons:\n1. Number not from temporary number service\n2. No messages received yet\n3. Number expired\n\nGet new numbers: .tempnum us`
            }, { quoted: message });
            return;
        }

        // Format OTP messages
        const messages = data.result;
        let messageList = '';
        
        messages.forEach((msg, index) => {
            // Extract OTP from message (common patterns)
            let otp = "Not found";
            const content = msg.content || '';
            
            // Look for common OTP patterns
            const otpPatterns = [
                /\b\d{4}\b/,  // 4-digit OTP
                /\b\d{5}\b/,  // 5-digit OTP  
                /\b\d{6}\b/,  // 6-digit OTP (most common)
                /\b\d{8}\b/,  // 8-digit OTP
                /code[:\s]\s*(\d+)/i,
                /otp[:\s]\s*(\d+)/i,
                /verification[:\s]\s*(\d+)/i,
                /password[:\s]\s*(\d+)/i
            ];
            
            for (const pattern of otpPatterns) {
                const match = content.match(pattern);
                if (match) {
                    otp = match[1] || match[0];
                    break;
                }
            }
            
            // Format message
            messageList += `${(index + 1).toString().padStart(2, ' ')}. *From:* ${msg.from || 'Unknown'}\n`;
            messageList += `   *OTP:* ${otp}\n`;
            messageList += `   *Time:* ${msg.time_wib || msg.timestamp || 'Unknown'}\n`;
            messageList += `   *Message:* ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}\n\n`;
        });

        await sock.sendMessage(chatId, {
            text: `🔑 *OTP MESSAGES FOR ${phoneNumber}*\n\n` +
                  `*Messages Found:* ${messages.length}\n\n` +
                  `${messageList}\n` +
                  `📱 *Get more numbers:* .tempnum <country-code>\n` +
                  `🌍 *See countries:* .templist\n\n` +
                  `🤖 *Powered by 404XMD*`
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('OTP check error:', error);
        
        let errorMsg = "❌ Failed to check OTP messages.";
        if (error.code === "ECONNABORTED") {
            errorMsg = "⏳ Request timeout. Please try again.";
        } else if (error.response?.status === 404) {
            errorMsg = "❌ Number not found or no messages received.";
        }

        await sock.sendMessage(chatId, {
            text: errorMsg + "\n\n*Usage:* .otpbox <full-number>\n*Example:* .otpbox +1234567890"
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};