const fetch = require('node-fetch');

async function shayariCommand(sock, chatId, message) {
    try {
        // Try multiple English shayari sources
        let shayariText = null;
        let source = "";
        
        // SOURCE 1: English quotes API (as shayari)
        try {
            const response = await fetch('https://api.quotable.io/random', { timeout: 8000 });
            const data = await response.json();
            if (data && data.content) {
                shayariText = data.content;
                source = "Quotable API";
                console.log("✅ Using English quotes as shayari");
            }
        } catch (error1) {
            console.log("Quote API failed:", error1.message);
        }
        
        // SOURCE 2: Type.fit quotes
        if (!shayariText) {
            try {
                const response = await fetch('https://type.fit/api/quotes', { timeout: 8000 });
                const data = await response.json();
                if (data && Array.isArray(data) && data.length > 0) {
                    const randomQuote = data[Math.floor(Math.random() * data.length)];
                    shayariText = randomQuote.text;
                    source = "Quotes API";
                    console.log("✅ Using type.fit quotes");
                }
            } catch (error2) {
                console.log("Type.fit failed:", error2.message);
            }
        }
        
        // SOURCE 3: Original shizo API (Hindi - no translation)
        if (!shayariText) {
            try {
                const response = await fetch('https://shizoapi.onrender.com/api/texts/shayari?apikey=shizo', { timeout: 10000 });
                const data = await response.json();
                if (data && data.result) {
                    shayariText = data.result;
                    source = "Hindi Shayari (Original)";
                    console.log("✅ Using original Hindi shayari");
                }
            } catch (error3) {
                console.log("Shizo API failed:", error3.message);
            }
        }
        
        // FALLBACK: Local English "shayari"
        if (!shayariText) {
            const englishShayaris = [
                "Friends are the poetry of life, each verse written in moments shared.",
                "In the garden of friendship, every memory is a blooming flower.",
                "True friendship is the art of finding rainbows in shared storms.",
                "A friend is a mirror showing us who we are and who we can become.",
                "Friendship is the golden thread that ties all hearts together.",
                "In the book of life, friends are the most beautiful chapters.",
                "A true friend is a treasure that never loses its value.",
                "Friendship is born when one heart says to another, 'You too? I thought I was alone.'",
                "The best kind of friendships are like fine wine – they get better with time.",
                "Friends are the family we choose for ourselves."
            ];
            
            const randomIndex = Math.floor(Math.random() * englishShayaris.length);
            shayariText = englishShayaris[randomIndex];
            source = "Local English Database";
            console.log("✅ Using local English shayari");
        }
        
        // Create buttons
        const buttons = [
            { buttonId: '.shayari', buttonText: { displayText: '📜 Another Shayari' }, type: 1 },
            { buttonId: '.quote', buttonText: { displayText: '💭 Get Quote' }, type: 1 },
            { buttonId: '.flirt', buttonText: { displayText: '💘 Flirt Line' }, type: 1 }
        ];
        
        // Format message
        const messageText = `📜 *Shayari/Quote*\n\n"${shayariText}"\n\n✨ *Source:* ${source}\n🔗 *Powered by 404-XMD*`;
        
        await sock.sendMessage(chatId, { 
            text: messageText,
            buttons: buttons,
            headerType: 1
        }, { quoted: message });
        
    } catch (error) {
        console.error('Shayari command error:', error);
        
        // Simple fallback
        await sock.sendMessage(chatId, { 
            text: '📜 *Shayari:*\n\n"Friends are the siblings God never gave us."\n\n✨ *404-XMD Bot*'
        }, { quoted: message });
    }
}

module.exports = { shayariCommand };