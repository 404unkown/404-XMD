const fetch = require('node-fetch');

async function goodnightCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/lovenight?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        let goodnightMessage = json.result;

        // English messages list
        const englishMessages = [
            "Good night! Sleep tight and dream sweet! 🌙✨",
            "Wishing you a peaceful night's sleep. Good night! 💫",
            "May your dreams be as wonderful as you are. Sweet dreams! 🌜",
            "Rest well and wake up refreshed! Good night! 🌃",
            "Time to recharge your batteries. Sleep well! 🛌💤",
            "Good night! Tomorrow is a new day full of possibilities! 🌅",
            "Let go of today's worries and drift into peaceful sleep. Good night! ⭐",
            "Dream beautiful dreams tonight! Good night! 🌠",
            "The night is for resting and rejuvenating. Good night! 🌌",
            "Sending you calming thoughts for a good night's sleep. Good night! 💭"
        ];

        // Check if API message is English
        const cleanApiMessage = goodnightMessage.replace(/[^\w\s.,!?'"-]/g, '');
        const isApiMessageEnglish = /^[A-Za-z\s.,!?'"-]+$/.test(cleanApiMessage) && 
                                   cleanApiMessage.length > 5;

        // Use API message if English, otherwise pick from our English list
        if (!isApiMessageEnglish) {
            const randomIndex = Math.floor(Math.random() * englishMessages.length);
            goodnightMessage = englishMessages[randomIndex];
        }

        // Send the goodnight message
        await sock.sendMessage(chatId, { text: goodnightMessage }, { quoted: message });
        
    } catch (error) {
        console.error('Error in goodnight command:', error);
        // Even on error, send an English message
        const errorMessages = [
            "Good night! Hope you have a wonderful sleep! 🌙",
            "Wishing you sweet dreams tonight! 💫",
            "Rest well and sleep tight! Good night! 🌜"
        ];
        const randomIndex = Math.floor(Math.random() * errorMessages.length);
        await sock.sendMessage(chatId, { text: errorMessages[randomIndex] }, { quoted: message });
    }
}

module.exports = { goodnightCommand };