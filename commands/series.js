const axios = require('axios');
const https = require('https');
const Config = require('../settings');

// Configure axios with better timeout and retry settings
const apiClient = axios.create({
  timeout: 30000,
  httpsAgent: new https.Agent({ 
    rejectUnauthorized: false,
    maxFreeSockets: 1,
    keepAlive: false
  }),
  maxRedirects: 2
});

async function seriesCommand(sock, chatId, message, args) {
    try {
        const text = args.join(' ').trim();
        
        // Input validation
        if (!text) {
            return sock.sendMessage(chatId, {
                text: `📺 *Usage:* ${Config.PREFIX}series <series> <season> <episode>\nExample: ${Config.PREFIX}series "Money Heist" 1 1`
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: "⏳", key: message.key } });

        // Parse input (supports both formats)
        let seriesName, seasonNum, episodeNum;
        
        // Format 1: "series S01E01"
        const seasonEpisodeMatch = text.match(/(.+?)\s*s(\d+)e(\d+)/i);
        if (seasonEpisodeMatch) {
            seriesName = seasonEpisodeMatch[1];
            seasonNum = seasonEpisodeMatch[2].padStart(2, '0');
            episodeNum = seasonEpisodeMatch[3].padStart(2, '0');
        } 
        // Format 2: "series 1 1"
        else {
            const parts = text.trim().split(/\s+/);
            if (parts.length >= 3) {
                seriesName = parts.slice(0, -2).join(' ');
                seasonNum = parts[parts.length-2].padStart(2, '0');
                episodeNum = parts[parts.length-1].padStart(2, '0');
            }
        }

        if (!seriesName || !seasonNum || !episodeNum) {
            return sock.sendMessage(chatId, {
                text: '📺 *Invalid format!* Use:\n.series <series> <season> <episode>\nOR\n.series <series> S01E01'
            }, { quoted: message });
        }

        // API request
        const apiUrl = `https://draculazyx-xyzdrac.hf.space/api/Movie/episode?query=${encodeURIComponent(`${seriesName} S${seasonNum}EP${episodeNum}`)}`;
        const { data } = await apiClient.get(apiUrl);

        if (!data?.download_link) {
            return sock.sendMessage(chatId, {
                text: '📺 *Episode not found!* Check your inputs or try another series'
            }, { quoted: message });
        }

        // Prepare and send episode info
        const cleanTitle = data.title.replace(/\s*\|\s*TV Series.*$/i, '').trim();
        const fileName = data.download_link.split('/').pop() || `${seriesName}_S${seasonNum}E${episodeNum}.mkv`;
        
        const episodeInfo = {
            text: `📺 *${cleanTitle}*\n\n` +
                  `🔄 S${seasonNum}E${episodeNum}\n` +
                  `🔗 ${data.download_link}\n\n` +
                  `> Powered By Lucky Tech Hub`,
            contextInfo: {
                externalAdReply: {
                    title: cleanTitle,
                    body: `Season ${seasonNum} • Episode ${episodeNum}`,
                    thumbnailUrl: 'https://files.catbox.moe/4itzeu.jpg',
                    mediaType: 1,
                    sourceUrl: data.download_link
                }
            }
        };
        await sock.sendMessage(chatId, episodeInfo, { quoted: message });

        // Now send the video file
        try {
            const videoResponse = await axios.get(data.download_link, {
                responseType: 'arraybuffer',
                timeout: 60000,
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });

            await sock.sendMessage(chatId, {
                video: videoResponse.data,
                caption: `📺 ${cleanTitle} - S${seasonNum}E${episodeNum}`,
                fileName: fileName,
                mimetype: 'video/mp4'
            });

            await sock.sendMessage(chatId, { react: { text: "✅", key: message.key } });
        } catch (downloadError) {
            console.error('Download failed:', downloadError);
            await sock.sendMessage(chatId, { react: { text: "⚠️", key: message.key } });
            sock.sendMessage(chatId, {
                text: '📺 *Video send failed!* Use the provided download link instead'
            }, { quoted: message });
        }

    } catch (error) {
        console.error('SeriesDL Error:', error);
        await sock.sendMessage(chatId, { react: { text: "❌", key: message.key } });
        sock.sendMessage(chatId, {
            text: '📺 *Error:* ' + (error.message || 'Check console for details')
        }, { quoted: message });
    }
}

module.exports = { seriesCommand };