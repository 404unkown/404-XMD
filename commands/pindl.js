const axios = require('axios');

module.exports = async function pindlCommand(sock, chatId, message, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: "📌 *Pinterest Downloader*\n\n" +
                      "📝 *Usage:* .pindl [pinterest-url]\n\n" +
                      "📋 *Examples:*\n" +
                      "• `.pindl https://pin.it/abc123`\n" +
                      "• `.pindl https://pinterest.com/pin/xyz789/`\n" +
                      "• `.pin https://pinterest.com/...`\n\n" +
                      "✨ *Features:*\n" +
                      "• Downloads Pinterest images/videos\n" +
                      "• Auto-detects media type\n" +
                      "• Preserves quality\n" +
                      "• Multiple alias support",
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

        const pinterestUrl = args[0];
        
        // Validate Pinterest URL
        if (!pinterestUrl.includes("pinterest") && !pinterestUrl.includes("pin.it")) {
            await sock.sendMessage(chatId, {
                text: "❌ *Invalid Pinterest URL*\n\n" +
                      "Please provide a valid Pinterest link.\n" +
                      "Examples:\n" +
                      "• https://pin.it/abc123\n" +
                      "• https://pinterest.com/pin/123456789/\n" +
                      "• https://www.pinterest.com/pin/123456789/",
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

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        await sock.sendMessage(chatId, {
            text: `🔍 *Processing Pinterest Link*\n\n⏳ Fetching media...`,
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

        // Call the API
        const apiUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(pinterestUrl)}`;
        const response = await axios.get(apiUrl, { timeout: 20000 });

        // Check API response
        if (!response.data || !response.data.success || !response.data.result?.media) {
            await sock.sendMessage(chatId, {
                text: `❌ *Failed to fetch Pinterest media*\n\n` +
                      `The API could not retrieve the content.\n` +
                      `Possible reasons:\n` +
                      `• Pin is private or deleted\n` +
                      `• Invalid URL format\n` +
                      `• API service temporarily unavailable\n` +
                      `• Media type not supported`,
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

        const result = response.data.result;
        const media = result.media;
        const description = result.description || 'No description available';
        const title = result.title || 'Pinterest Media';

        // Find best quality media
        let bestMedia = media[0];
        let mediaType = 'image'; // default
        
        // Try to find video (prioritize higher quality)
        const videos = media.filter(item => item.type?.toLowerCase().includes('video') || 
                                           item.type?.toLowerCase().includes('mp4'));
        if (videos.length > 0) {
            bestMedia = videos[0];
            mediaType = 'video';
            // Try to find higher quality video
            const hdVideo = videos.find(v => v.type?.includes('720p') || v.type?.includes('1080p'));
            if (hdVideo) bestMedia = hdVideo;
        } else {
            // For images, find the highest resolution
            const images = media.filter(item => item.type?.toLowerCase().includes('image') || 
                                              !item.type?.toLowerCase().includes('video'));
            if (images.length > 0) {
                bestMedia = images[0];
                mediaType = 'image';
            }
        }

        const downloadUrl = bestMedia.download_url || bestMedia.url;
        
        if (!downloadUrl) {
            throw new Error('No download URL found');
        }

        // Prepare the caption in your desired format
        const desc = `
╭━━━〔 *404 XMD* 〕━┈⊷
┃▸╭───────────
┃▸┊๏ *ᴘɪɴᴛᴇʀᴇsᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
┃▸╰───────────···๏
╰────────────────┈⊷
╭━━┈┈┈┈┈┈┈┈┈━⪼
┇๏ *ᴛɪᴛᴛʟᴇ* - ${title}
┇๏ *ᴍᴇᴅɪᴀ ᴛʏᴘᴇ* - ${bestMedia.type || mediaType}
┇๏ *ǫᴜᴀʟɪᴛʏ* - ${bestMedia.quality || 'Standard'}
╰━━┈┈┈┈┈┈┈┈┈━⪼
${description ? `╭━━┈┈┈┈┈┈┈┈┈━⪼\n┇๏ *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ* - ${description.substring(0, 200)}${description.length > 200 ? '...' : ''}\n╰━━┈┈┈┈┈┈┈┈┈━⪼\n` : ''}
> *© Powered By Lucky Tech Hub*`;

        // Send downloading message
        await sock.sendMessage(chatId, {
            text: `📥 *Downloading Pinterest Media*\n\n` +
                  `📌 *Title:* ${title}\n` +
                  `📁 *Type:* ${mediaType === 'video' ? 'Video' : 'Image'}\n` +
                  `⚙️ *Quality:* ${bestMedia.quality || 'Standard'}\n` +
                  `⏳ *Downloading...*`,
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

        // Send media based on type
        if (mediaType === 'video') {
            try {
                await sock.sendMessage(chatId, {
                    video: { url: downloadUrl },
                    caption: desc,
                    contextInfo: contextInfo
                }, { quoted: message });
            } catch (videoError) {
                console.log('Video send failed, trying as document:', videoError.message);
                // Fallback to document if video fails
                await sock.sendMessage(chatId, {
                    document: { url: downloadUrl },
                    fileName: `pinterest_video_${Date.now()}.mp4`,
                    mimetype: 'video/mp4',
                    caption: desc,
                    contextInfo: contextInfo
                }, { quoted: message });
            }
        } else {
            // Send as image
            try {
                await sock.sendMessage(chatId, {
                    image: { url: downloadUrl },
                    caption: desc,
                    contextInfo: contextInfo
                }, { quoted: message });
            } catch (imageError) {
                console.log('Image send failed, trying as document:', imageError.message);
                // Fallback to document if image fails
                await sock.sendMessage(chatId, {
                    document: { url: downloadUrl },
                    fileName: `pinterest_image_${Date.now()}.jpg`,
                    mimetype: 'image/jpeg',
                    caption: desc,
                    contextInfo: contextInfo
                }, { quoted: message });
            }
        }

        // Success reaction and message
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        await sock.sendMessage(chatId, {
            text: `✅ *Pinterest Download Complete*\n\n` +
                  `📌 Successfully downloaded: ${title}\n` +
                  `📁 Media type: ${mediaType === 'video' ? 'Video' : 'Image'}\n` +
                  `🔗 Original: ${pinterestUrl}`,
            contextInfo: contextInfo
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Pinterest download error:', error.message);
        
        let errorMessage = '❌ *Download Failed*\n\n';
        
        if (error.code === 'ECONNABORTED') {
            errorMessage += 'Request timeout. The API might be slow or unresponsive.';
        } else if (error.response?.status === 404) {
            errorMessage += 'Pin not found or URL is invalid.';
        } else if (error.response?.status === 403) {
            errorMessage += 'Access denied. Pin might be private or restricted.';
        } else if (error.message.includes('download_url')) {
            errorMessage += 'No media URL found in the API response.';
        } else {
            errorMessage += `Error: ${error.message}\n\nPlease try a different pin or try again later.`;
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