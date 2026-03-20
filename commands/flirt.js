const fetch = require('node-fetch');

async function flirtCommand(sock, chatId, message) {
    try {
        // Try to get English flirt directly from alternative API
        let flirtMessage = null;
        
        // API 1: Try English flirt API
        try {
            const res = await fetch('https://api.popcat.xyz/pickuplines');
            const data = await res.json();
            flirtMessage = data.pickupline;
        } catch (error) {
            console.log('English API failed, trying Hindi...');
        }
        
        // API 2: Try original Hindi API (as backup)
        if (!flirtMessage) {
            try {
                const res = await fetch('https://shizoapi.onrender.com/api/texts/flirt?apikey=shizo');
                const data = await res.json();
                flirtMessage = data.result;
            } catch (hindiError) {
                console.log('Hindi API also failed');
            }
        }
        
        // Fallback to local English flirts
        if (!flirtMessage) {
            const englishFlirts = [
                "Are you a magician? Because whenever I look at you, everyone else disappears.",
                "Do you have a map? I keep getting lost in your eyes.",
                "Is your name Google? Because you have everything I've been searching for.",
                "Are you a camera? Because every time I look at you, I smile."
            ];
            flirtMessage = englishFlirts[Math.floor(Math.random() * englishFlirts.length)];
        }
        
        await sock.sendMessage(chatId, { 
            text: `💘 *Flirt Message:*\n\n"${flirtMessage}"\n\n✨ *404-XMD*` 
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in flirt command:', error);
        await sock.sendMessage(chatId, { 
            text: '💘 *Flirt:*\n\n"Are you French? Because Eiffel for you."\n\n✨ *404-XMD*' 
        }, { quoted: message });
    }
}

module.exports = { flirtCommand };