// /commands/getimage.js
const axios = require('axios');

module.exports = async function getimageCommand(sock, chatId, message, args = []) {
    try {
        // Get the URL from the message
        const text = message.message?.conversation?.trim() ||
                     message.message?.extendedTextMessage?.text?.trim() ||
                     '';
        
        // Extract URL (remove command part)
        let imageUrl;
        if (args.length > 0) {
            // If args provided, join them
            imageUrl = args.join(' ').trim();
        } else {
            // Try to get from text
            const parts = text.split(' ').slice(1);
            imageUrl = parts.join(' ').trim();
        }

        // Check if URL is provided
        if (!imageUrl) {
            await sock.sendMessage(chatId, {
                text: `*🖼️ Image URL Converter*\n\nPlease provide an image URL\n\n*Usage:*\n.getimage https://example.com/image.jpg\n\n*Example:*\n.getimage https://picsum.photos/1080/1920\n\n*Supported formats:* JPG, PNG, GIF, WebP`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }

        // Validate URL format
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            await sock.sendMessage(chatId, {
                text: '*❌ Invalid URL*\nURL must start with http:// or https://',
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }

        // Send processing message
        const processingMsg = await sock.sendMessage(chatId, {
            text: '*🔄 Downloading and processing image...*',
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: message });

        try {
            // Download the image directly (no HEAD request to avoid server blocks)
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
                maxContentLength: 20 * 1024 * 1024, // 20MB
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Referer': 'https://www.google.com/'
                }
            });

            const imageBuffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || 'application/octet-stream';
            const contentLength = parseInt(response.headers['content-length'] || '0');

            // Check if it's an image based on content-type
            if (!contentType.startsWith('image/')) {
                await sock.sendMessage(chatId, {
                    text: `*❌ Not an image file*\nContent-Type: ${contentType}\n\nPlease provide a direct link to an image (JPG, PNG, GIF, WebP).`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                return;
            }

            // Check file size (max 20MB for WhatsApp)
            if (contentLength > 20 * 1024 * 1024 && contentLength > 0) { // 20MB
                await sock.sendMessage(chatId, {
                    text: `*⚠️ Image too large*\nSize: ${(contentLength / (1024 * 1024)).toFixed(2)}MB\nMaximum allowed: 20MB\n\nPlease use a smaller image.`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                return;
            }

            // Verify it's a valid image by checking magic bytes
            const isJpg = imageBuffer.slice(0, 3).toString('hex') === 'ffd8ff';
            const isPng = imageBuffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
            const isGif = imageBuffer.slice(0, 6).toString().includes('GIF');
            const isWebp = imageBuffer.slice(0, 4).toString() === 'RIFF' && 
                          imageBuffer.slice(8, 12).toString() === 'WEBP';

            if (!isJpg && !isPng && !isGif && !isWebp) {
                await sock.sendMessage(chatId, {
                    text: '*❌ Invalid image file*\nThe downloaded file is not a valid image.\n\nPlease check the URL and try again.',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                return;
            }

            // Send the image
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🖼️ Image from URL\n\n🔗 ${imageUrl}\n📏 ${(imageBuffer.length / 1024).toFixed(2)}KB\n📝 ${contentType}\n\nDownloaded with 404-XMD`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    mentionedJid: [message.key.participant || message.key.remoteJid],
                    externalAdReply: {
                        title: "🖼️ Image Downloaded",
                        body: `Powered by 404-XMD`,
                        mediaType: 1,
                        thumbnailUrl: imageUrl,
                        sourceUrl: imageUrl
                    }
                }
            }, { quoted: message });

            // Delete processing message
            try {
                await sock.sendMessage(chatId, { delete: processingMsg.key });
            } catch (deleteError) {
                // Ignore if can't delete
            }

            // Success reaction
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });

        } catch (downloadError) {
            console.error('Download error:', downloadError.message);
            
            // Delete processing message on error
            try {
                await sock.sendMessage(chatId, { delete: processingMsg.key });
            } catch (deleteError) {
                // Ignore if can't delete
            }
            
            // Handle specific errors
            if (downloadError.code === 'ECONNABORTED' || downloadError.code === 'ETIMEDOUT') {
                await sock.sendMessage(chatId, {
                    text: '*❌ Download timeout*\nThe server took too long to respond.\n\nPlease try a different URL or try again later.',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
            } else if (downloadError.response?.status === 404) {
                await sock.sendMessage(chatId, {
                    text: '*❌ Image not found (404)*\nThe URL points to a non-existent image.\n\nMake sure the URL is correct.',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
            } else if (downloadError.response?.status === 403) {
                await sock.sendMessage(chatId, {
                    text: '*❌ Access forbidden (403)*\nThe server denied access to this image.\n\nThe server may block bot requests.',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
            } else if (downloadError.response?.status === 429) {
                await sock.sendMessage(chatId, {
                    text: '*⚠️ Rate limited*\nToo many requests to this server.\n\nPlease wait a few minutes before trying again.',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `*❌ Download failed*\nError: ${downloadError.message}\n\nPlease check the URL and try again.`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
            }
            
            // Error reaction
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });
        }

    } catch (error) {
        console.error('Getimage command error:', error);
        await sock.sendMessage(chatId, {
            text: `*❌ Unexpected error*\n${error.message}\n\nPlease try again or use a different URL.`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: message });
        
        // Error reaction
        await sock.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
};