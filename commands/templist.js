const axios = require("axios");

module.exports = async (sock, chatId, message, rawText) => {
    try {
        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const apiUrl = "https://api.vreden.my.id/api/tools/fakenumber/country";
        const { data } = await axios.get(apiUrl, { timeout: 10000 });

        if (!data?.result || !Array.isArray(data.result)) {
            throw new Error("Invalid API response");
        }

        // Group countries for better display
        const countries = data.result;
        let countryList = '';
        
        // Show in 2 columns for better readability
        const half = Math.ceil(countries.length / 2);
        
        for (let i = 0; i < half; i++) {
            const country1 = countries[i];
            const country2 = countries[i + half];
            
            let line = `${(i + 1).toString().padStart(2, ' ')}. ${country1.title} (${country1.id})`;
            
            if (country2) {
                line += `\t${(i + half + 1).toString().padStart(2, ' ')}. ${country2.title} (${country2.id})`;
            }
            
            countryList += line + '\n';
        }

        await sock.sendMessage(chatId, {
            text: `🌍 *TEMPORARY NUMBER COUNTRIES*\n\n` +
                  `*Total Countries:* ${countries.length}\n\n` +
                  `${countryList}\n\n` +
                  `🔧 *How to use:*\n` +
                  `1. Find your country code (in parentheses)\n` +
                  `2. Use: .tempnum <code>\n` +
                  `3. Example: .tempnum us\n\n` +
                  `*Popular codes:*\n` +
                  `• us - United States\n` +
                  `• gb - United Kingdom\n` +
                  `• in - India\n` +
                  `• pk - Pakistan\n` +
                  `• id - Indonesia\n` +
                  `• ng - Nigeria\n\n` +
                  `🤖 *Powered by 404XMD*`
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Country list error:', error);
        
        await sock.sendMessage(chatId, {
            text: "❌ Failed to fetch country list. Please try again later."
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};