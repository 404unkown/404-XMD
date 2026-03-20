const axios = require('axios');

module.exports = async function ytpostCommand(sock, chatId, message, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: "📢 *YouTube Community Post Downloader*\n\n" +
                      "📝 *Usage:* .ytpost [youtube-community-post-url]\n\n" +
                      "📋 *Examples:*\n" +
                      "• `.ytpost https://www.youtube.com/post/AbCdEfG123`\n" +
                      "• `.ytpost https://youtube.com/channel/.../community?lb=...`\n" +
                      "• `.ytpost https://www.youtube.com/channel/.../community`\n\n" +
                      "✨ *Features:*\n" +
                      "• Downloads YouTube community posts\n" +
                      "• Extracts text content\n" +
                      "• Downloads images from the post\n" +
                      "• Supports multiple image posts\n\n" +
                      "⚠️ *Note:* Requires valid YouTube community post URL",
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

        const postUrl = args.join(' ');
        
        // Validate YouTube URL
        if (!postUrl.includes("youtube.com") && !postUrl.includes("youtu.be")) {
            await sock.sendMessage(chatId, {
                text: "❌ *Invalid YouTube URL*\n\n" +
                      "Please provide a valid YouTube community post URL.\n" +
                      "It should contain 'youtube.com' or 'youtu.be'",
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
            text: `🔍 *Fetching YouTube Community Post*\n\n⏳ Processing: ${postUrl}`,
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
        const apiUrl = `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(postUrl)}`;
        const response = await axios.get(apiUrl, { timeout: 20000 });

        // Check API response
        if (!response.data?.status || !response.data?.data) {
            await sock.sendMessage(chatId, {
                text: "❌ *Failed to fetch community post*\n\n" +
                      "Possible reasons:\n" +
                      "1. URL is not a valid community post\n" +
                      "2. Post might be private or deleted\n" +
                      "3. API service is temporarily unavailable\n" +
                      "4. Try a different community post URL",
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

        const post = response.data.data;
        const sender = message.key.participant || message.key.remoteJid;
        
        // Create caption
        let caption = `📢 *YouTube Community Post* 📢\n\n`;
        
        if (post.content) {
            // Truncate content if too long (WhatsApp has character limits)
            const maxLength = 1500;
            let content = post.content;
            if (content.length > maxLength) {
                content = content.substring(0, maxLength) + "...\n\n[Content truncated due to length]";
            }
            caption += `📜 *Content:*\n${content}\n\n`;
        }
        
        if (post.author) {
            caption += `👤 *Author:* ${post.author}\n`;
        }
        
        if (post.date) {
            caption += `📅 *Posted:* ${post.date}\n`;
        }
        
        if (post.likes) {
            caption += `👍 *Likes:* ${post.likes}\n`;
        }
        
        if (post.comments) {
            caption += `💬 *Comments:* ${post.comments}\n`;
        }
        
        caption += `\n🔗 *Source:* YouTube Community\n`;
        caption += `> © Powered By 404 TECH`;

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

        // Handle images if available
        if (post.images && Array.isArray(post.images) && post.images.length > 0) {
            const imageCount = Math.min(post.images.length, 10); // Limit to 10 images
            
            await sock.sendMessage(chatId, {
                text: `✅ *Found ${post.images.length} image(s) in the post*\n📤 Sending ${imageCount} image(s)...`,
                contextInfo: contextInfo
            }, { quoted: message });
            
            let sentImages = 0;
            
            for (let i = 0; i < imageCount; i++) {
                const imgUrl = post.images[i];
                try {
                    // For first image, include full caption
                    // For subsequent images, include minimal info
                    let imgCaption = caption;
                    if (i > 0) {
                        imgCaption = `📷 Image ${i + 1} of ${imageCount}\n> © Powered BY 404 TECH`;
                    }
                    
                    await sock.sendMessage(chatId, {
                        image: { url: imgUrl },
                        caption: imgCaption,
                        contextInfo: i === 0 ? contextInfo : undefined
                    }, { quoted: message });
                    
                    sentImages++;
                    
                    // Delay between images to avoid rate limiting
                    if (i < imageCount - 1) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } catch (imgError) {
                    console.warn(`⚠️ Failed to send image ${i + 1}:`, imgError.message);
                }
            }
            
            if (sentImages > 0) {
                await sock.sendMessage(chatId, {
                    text: `✅ Successfully sent ${sentImages} image(s) from the community post`,
                    contextInfo: contextInfo
                }, { quoted: message });
            }
        } else {
            // No images, send text only
            await sock.sendMessage(chatId, {
                text: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        }

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('❌ YouTube post error:', error.message);
        
        let errorMessage = "❌ *Failed to download community post*\n\n";
        
        if (error.code === 'ECONNABORTED') {
            errorMessage += "Request timeout. The API might be slow or the post is too large.";
        } else if (error.response?.status === 404) {
            errorMessage += "Post not found or URL is invalid.";
        } else if (error.response?.status === 403) {
            errorMessage += "Access denied. Post might be private or age-restricted.";
        } else if (error.message.includes('Invalid URL')) {
            errorMessage += "Invalid YouTube URL format.";
        } else {
            errorMessage += `Error: ${error.message || "Unknown error"}\n\nTry a different post or try again later.`;
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