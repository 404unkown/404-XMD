const axios = require("axios");

module.exports = async (sock, chatId, message, rawText) => {
    try {
        const args = rawText.trim().split(' ');
        const countryCode = args[1];
        
        if (!countryCode) {
            await sock.sendMessage(chatId, {
                text: "❌ *Usage:* .tempnum <country-code>\n\n*Example:* .tempnum us\n.tempnum gb\n.tempnum in\n\n*Tip:* Use .templist to see all available countries"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const apiUrl = `https://api.vreden.my.id/api/tools/fakenumber/listnumber?id=${countryCode.toLowerCase()}`;
        const { data } = await axios.get(apiUrl, { timeout: 10000 });

        if (!data?.result || !Array.isArray(data.result) || data.result.length === 0) {
            await sock.sendMessage(chatId, {
                text: `📭 No temporary numbers available for *${countryCode.toUpperCase()}*\n\nTry another country code:\n.tempnum us (United States)\n.tempnum gb (United Kingdom)\n.tempnum in (India)\n.tempnum pk (Pakistan)\n\nOr use .templist to see all countries`
            }, { quoted: message });
            return;
        }

        // Format the numbers
        const numbers = data.result.slice(0, 20); // Limit to 20 numbers
        let numberList = '';
        
        numbers.forEach((num, index) => {
            numberList += `${(index + 1).toString().padStart(2, ' ')}. ${num.number}\n`;
        });

        await sock.sendMessage(chatId, {
            text: `📱 *TEMPORARY NUMBERS - ${countryCode.toUpperCase()}*\n\n` +
                  `*Country:* ${countryCode.toUpperCase()}\n` +
                  `*Available:* ${data.result.length} numbers\n` +
                  `\n${numberList}\n` +
                  `🔑 *How to use:*\n` +
                  `1. Copy a number\n` +
                  `2. Use it for registration\n` +
                  `3. Check OTP with: .otpbox <number>\n\n` +
                  `*Example:* .otpbox +1234567890\n\n` +
                  `🤖 *Powered by 404XMD*`
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Temp number error:', error);
        
        let errorMsg = "❌ Failed to fetch temporary numbers.";
        if (error.code === "ECONNABORTED") {
            errorMsg = "⏳ API timeout. Please try again.";
        } else if (error.message.includes("404")) {
            errorMsg = "❌ Country code not found. Try .templist to see available countries.";
        }

        await sock.sendMessage(chatId, {
            text: errorMsg + "\n\n*Usage:* .tempnum <country-code>\n*Example:* .tempnum us"
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};