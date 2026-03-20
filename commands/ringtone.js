const axios = require("axios");

async function ringtoneCommand(sock, chatId, message, args) {
    try {
        const query = args.join(" ");
        if (!query) {
            return sock.sendMessage(chatId, {
                text: "Please provide a search query! Example: .ringtone Suna"
            }, { quoted: message });
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`);

        if (!data.status || !data.result || data.result.length === 0) {
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return sock.sendMessage(chatId, {
                text: "No ringtones found for your query. Please try a different keyword."
            }, { quoted: message });
        }

        const randomRingtone = data.result[Math.floor(Math.random() * data.result.length)];

        // Download the audio first
        const response = await axios.get(randomRingtone.dl_link, {
            responseType: 'arraybuffer'
        });

        // Send the audio
        await sock.sendMessage(
            chatId,
            {
                audio: response.data,
                mimetype: "audio/mpeg",
                fileName: `${randomRingtone.title.replace(/[^\w\s]/gi, '')}.mp3`,
            },
            { quoted: message }
        );

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Error in ringtone command:", error);
        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        sock.sendMessage(chatId, {
            text: "Sorry, something went wrong while fetching the ringtone. Please try again later."
        }, { quoted: message });
    }
}

module.exports = { ringtoneCommand };