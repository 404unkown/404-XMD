const axios = require('axios');

// Configure axios with longer timeout for video downloads
const axiosInstance = axios.create({
  timeout: 30000,
  maxRedirects: 5
});

module.exports = async function yvideoCommand(sock, chatId, message, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: "🔞 *18+ Video Downloader*\n\n" +
                      "⚠️ *Warning:* This command is for 18+ content only\n\n" +
                      "📝 *Usage:* .yvideo <search-query>\n\n" +
                      "📋 *Examples:*\n" +
                      "• `.xvideo big boobs`\n" +
                      "• `.xvideo sexy girl`\n" +
                      "• `.hentai anime`\n\n" +
                      "✨ *Features:*\n" +
                      "• Searches and downloads adult videos\n" +
                      "• Auto-detects best quality\n" +
                      "• Shows preview before download\n" +
                      "• Fast and reliable",
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
            return;
        }

        const searchQuery = args.join(' ');
        
        // Warning message for adult content
        await sock.sendMessage(chatId, {
            text: "⚠️ *WARNING: 18+ CONTENT*\n\n" +
                  "This command provides access to adult material.\n" +
                  "Ensure you are 18 years or older.\n\n" +
                  "⏳ Searching for: " + searchQuery,
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

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Query the API
        const apiUrl = `https://draculazyx-xyzdrac.hf.space/api/Xvideos?q=${encodeURIComponent(searchQuery.trim())}`;
        const response = await axiosInstance.get(apiUrl);

        // Check API response
        if (!response.data || response.data.STATUS !== 200 || !response.data.video?.downloadLink) {
            await sock.sendMessage(chatId, {
                text: "❌ *No Results Found*\n\n" +
                      "No adult videos found for: " + searchQuery + "\n\n" +
                      "Try different search terms or check if the service is available.",
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
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const { title, imageUrl, videoUrl, downloadLink } = response.data.video;
        
        // Send preview with thumbnail
        await sock.sendMessage(chatId, {
            text: `🔞 *Video Found*\n\n` +
                  `📹 *Title:* ${title}\n` +
                  `🔗 *Source:* ${videoUrl}\n` +
                  `⚙️ *Quality:* Standard\n` +
                  `⏳ *Downloading preview...*`,
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

        let thumbBuffer = null;
        // Try to get thumbnail
        try {
            const thumbResponse = await axiosInstance.get(imageUrl, { 
                responseType: 'arraybuffer',
                timeout: 10000 
            });
            thumbBuffer = Buffer.from(thumbResponse.data);
        } catch (thumbError) {
            console.log('Thumbnail fetch failed, continuing without it');
        }

        // Send thumbnail if available
        if (thumbBuffer) {
            await sock.sendMessage(chatId, {
                image: thumbBuffer,
                caption: `🔞 *Preview: ${title}*\n\n` +
                         `Click the video URL below to view online:\n` +
                         `${videoUrl}\n\n` +
                         `⏳ *Downloading video...*`,
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
        }

        // Download the video
        await sock.sendMessage(chatId, {
            text: `📥 *Downloading Video*\n\n` +
                  `📹 ${title}\n` +
                  `⏳ Please wait, this may take a moment...`,
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

        const videoResponse = await axiosInstance.get(downloadLink, {
            responseType: 'arraybuffer',
            timeout: 120000, // 2 minutes for video download
            maxContentLength: 100 * 1024 * 1024, // 100MB max
            headers: { 
                'Referer': 'https://www.xvideos.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!videoResponse.data || videoResponse.data.length < 10000) {
            throw new Error('Video file too small or corrupted');
        }

        const videoBuffer = Buffer.from(videoResponse.data);
        
        // Clean filename for safe saving
        const safeTitle = title
            .replace(/[\\/:"*?<>|]/g, '')
            .substring(0, 50)
            .trim() || 'adult_video';
        
        const sender = message.key.participant || message.key.remoteJid;
        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401269012709@newsletter',
                newsletterName: '404 XMD',
                serverMessageId: -1
            }
        };

        // Send the video
        try {
            await sock.sendMessage(chatId, {
                video: videoBuffer,
                fileName: `${safeTitle}_${Date.now()}.mp4`,
                caption: `🔞 *${title}*\n\n` +
                         `📹 Downloaded via 404 XMD Bot\n` +
                         `🔗 Source: ${videoUrl}\n` +
                         `> © Powered By Lucky Tech Hub`,
                contextInfo: contextInfo
            }, { quoted: message });
        } catch (sendError) {
            console.log('Video send failed, trying as document:', sendError.message);
            // Fallback to document
            await sock.sendMessage(chatId, {
                document: videoBuffer,
                fileName: `${safeTitle}.mp4`,
                mimetype: 'video/mp4',
                caption: `🔞 *${title}*\n\n` +
                         `📹 Downloaded via 404 XMD Bot\n` +
                         `🔗 Source: ${videoUrl}\n` +
                         `> © Powered By Lucky Tech Hub`,
                contextInfo: contextInfo
            }, { quoted: message });
        }

        // Success reaction and final message
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        await sock.sendMessage(chatId, {
            text: `✅ *Download Complete*\n\n` +
                  `🔞 Video successfully downloaded\n` +
                  `📹 ${title}\n` +
                  `📊 Size: ${Math.round(videoBuffer.length / (1024 * 1024))}MB\n` +
                  `🎬 Enjoy responsibly!`,
            contextInfo: contextInfo
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Adult video download error:', error.message);
        
        let errorMessage = '❌ *Download Failed*\n\n';
        
        if (error.code === 'ECONNABORTED') {
            errorMessage += 'Download timeout. The video might be too large or server is slow.';
        } else if (error.response?.status === 404) {
            errorMessage += 'Video not found or removed.';
        } else if (error.response?.status === 403) {
            errorMessage += 'Access denied. Content might be restricted in your region.';
        } else if (error.message.includes('maxContentLength')) {
            errorMessage += 'Video is too large (max 100MB).';
        } else if (error.message.includes('too small')) {
            errorMessage += 'Video file appears corrupted.';
        } else {
            errorMessage += `Error: ${error.message}\n\nPlease try different search terms.`;
        }

        await sock.sendMessage(chatId, {
            text: errorMessage,
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

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};