const yts = require('yt-search');
const axios = require('axios');

const BASE_URL = 'https://noobs-api.top';

module.exports = async (client, chatId, m, args, sender, pushName, isOwner) => {
    const text = args.join(' ');
    
    if (!text) {
        await client.sendMessage(chatId, { 
            text: '🎵 *Please provide a song name!*' 
        }, { quoted: m });
        return;
    }

    await client.sendMessage(chatId, {
        react: { text: '⏳', key: m.key }
    });

    try {
        const search = await yts(text);
        const video = search.videos[0];
        
        if (!video) {
            await client.sendMessage(chatId, { 
                text: '❌ No results found!' 
            }, { quoted: m });
            return;
        }

        await client.sendMessage(chatId, { 
            text: `_Please wait your download is in progress..._` 
        }, { quoted: m });

        const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
        const fileName = `${safeTitle}.mp3`;
        const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

        const response = await axios.get(apiURL);
        const data = response.data;

        if (!data.downloadLink) {
            await client.sendMessage(chatId, {
                text: '❌ Failed to retrieve the MP3 download link.'
            }, { quoted: m });
            return;
        }

        await client.sendMessage(chatId, {
            document: { url: data.downloadLink },
            mimetype: 'audio/mpeg',
            fileName: fileName,
            caption: `🎵 *${video.title}*\n⏱️ ${video.timestamp}\n👤 ${video.author.name}`
        }, { quoted: m });

    } catch (err) {
        console.error('[PLAY] Error:', err);
        await client.sendMessage(chatId, {
            text: '❌ An error occurred while processing your request.'
        }, { quoted: m });
        await client.sendMessage(chatId, {
            react: { text: '❌', key: m.key }
        });
    }
};