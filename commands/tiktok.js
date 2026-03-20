const axios = require('axios');

// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
    try {
        // Check if message has already been processed
        if (processedMessages.has(message.key.id)) {
            return;
        }
        
        // Add message ID to processed set
        processedMessages.add(message.key.id);
        
        // Clean up old message IDs after 5 minutes
        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Please provide a TikTok link.\n\n*Example:* .tiktok https://vm.tiktok.com/XXXXXX"
            }, { quoted: message });
        }

        // Extract URL from command
        const url = text.split(' ').slice(1).join(' ').trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Please provide a TikTok link.\n\n*Example:* .tiktok https://vm.tiktok.com/XXXXXX"
            }, { quoted: message });
        }

        // Check for various TikTok URL formats
        const tiktokPatterns = [
            /https?:\/\/(?:www\.)?tiktok\.com\//,
            /https?:\/\/(?:vm\.)?tiktok\.com\//,
            /https?:\/\/(?:vt\.)?tiktok\.com\//,
            /https?:\/\/(?:www\.)?tiktok\.com\/@/,
            /https?:\/\/(?:www\.)?tiktok\.com\/t\//
        ];

        const isValidUrl = tiktokPatterns.some(pattern => pattern.test(url));
        
        if (!isValidUrl) {
            return await sock.sendMessage(chatId, { 
                text: "❌ That is not a valid TikTok link. Please provide a valid TikTok video link."
            }, { quoted: message });
        }

        // Send processing reaction
        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        try {
            // Use only Siputzx API
            const apiUrl = `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`;
            
            let videoUrl = null;
            let title = "TikTok Video";

            // Call Siputzx API
            try {
                console.log('📥 Downloading TikTok video via Siputzx API:', url);
                
                const response = await axios.get(apiUrl, { 
                    timeout: 15000,
                    headers: {
                        'accept': '*/*',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.data && response.data.status && response.data.data) {
                    // Check for urls array first (this is the main response format)
                    if (response.data.data.urls && Array.isArray(response.data.data.urls) && response.data.data.urls.length > 0) {
                        // Use the first URL from the urls array (usually HD quality)
                        videoUrl = response.data.data.urls[0];
                        title = response.data.data.metadata?.title || "TikTok Video";
                        console.log('✅ Found video URL from urls array');
                    } 
                    // Check for video_url
                    else if (response.data.data.video_url) {
                        videoUrl = response.data.data.video_url;
                        title = response.data.data.metadata?.title || "TikTok Video";
                        console.log('✅ Found video URL from video_url');
                    }
                    // Check for url
                    else if (response.data.data.url) {
                        videoUrl = response.data.data.url;
                        title = response.data.data.metadata?.title || "TikTok Video";
                        console.log('✅ Found video URL from url');
                    }
                    // Check for download_url
                    else if (response.data.data.download_url) {
                        videoUrl = response.data.data.download_url;
                        title = response.data.data.metadata?.title || "TikTok Video";
                        console.log('✅ Found video URL from download_url');
                    }
                }
                
                console.log('✅ API Response received:', videoUrl ? 'Video URL found' : 'No video URL');
                
            } catch (apiError) {
                console.error('❌ Siputzx API failed:', apiError.message);
            }

            // If no video URL found
            if (!videoUrl) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                
                return await sock.sendMessage(chatId, { 
                    text: "❌ Could not fetch video from TikTok. The API might be down or the video is unavailable.\n\nPlease try:\n1. A different TikTok link\n2. Try again later"
                }, { quoted: message });
            }

            // Try to download and send the video
            try {
                console.log('📥 Downloading video buffer from:', videoUrl);
                
                // Download video as buffer
                const videoResponse = await axios.get(videoUrl, {
                    responseType: 'arraybuffer',
                    timeout: 60000,
                    maxContentLength: 100 * 1024 * 1024, // 100MB limit
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'video/mp4,video/*,*/*;q=0.9',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Referer': 'https://www.tiktok.com/'
                    }
                });
                
                const videoBuffer = Buffer.from(videoResponse.data);
                
                // Validate video buffer
                if (videoBuffer.length === 0) {
                    throw new Error("Video buffer is empty");
                }
                
                console.log(`✅ Video downloaded: ${videoBuffer.length} bytes`);
                
                // Check if it's a valid video file (basic check)
                const isValidVideo = videoBuffer.length > 10000;
                
                if (!isValidVideo) {
                    const bufferText = videoBuffer.toString('utf8', 0, 200);
                    if (bufferText.includes('error') || bufferText.includes('blocked') || bufferText.includes('403')) {
                        throw new Error("Received error page instead of video");
                    }
                }
                
                const caption = title 
                    ? `*TIKTOK DOWNLOADER*\n\n📝 *Title:* ${title}\n✅ Video downloaded successfully!`
                    : `*TIKTOK DOWNLOADER*\n\n✅ Video downloaded successfully!`;
                
                await sock.sendMessage(chatId, {
                    video: videoBuffer,
                    mimetype: "video/mp4",
                    caption: caption
                }, { quoted: message });

                // Success reaction
                await sock.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });

                console.log('✅ TikTok video sent successfully');
                return;
                
            } catch (downloadError) {
                console.error(`❌ Failed to download video buffer: ${downloadError.message}`);
                
                // Fallback to URL method
                try {
                    console.log('📥 Falling back to URL method');
                    
                    const caption = title 
                        ? `*TIKTOK DOWNLOADER*\n\n📝 *Title:* ${title}\n✅ Video downloaded successfully!`
                        : `*TIKTOK DOWNLOADER*\n\n✅ Video downloaded successfully!`;
                    
                    await sock.sendMessage(chatId, {
                        video: { url: videoUrl },
                        mimetype: "video/mp4",
                        caption: caption
                    }, { quoted: message });

                    // Success reaction
                    await sock.sendMessage(chatId, { 
                        react: { text: '✅', key: message.key } 
                    });

                    console.log('✅ TikTok video sent via URL method');
                    return;
                    
                } catch (urlError) {
                    console.error(`❌ URL method also failed: ${urlError.message}`);
                    
                    await sock.sendMessage(chatId, { 
                        react: { text: '❌', key: message.key } 
                    });
                    
                    return await sock.sendMessage(chatId, { 
                        text: "❌ Failed to download the video. The video link might be expired or restricted."
                    }, { quoted: message });
                }
            }

        } catch (error) {
            console.error('❌ Error in TikTok download:', error);
            
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            
            await sock.sendMessage(chatId, { 
                text: "❌ Failed to download the TikTok video. Please try again with a different link."
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('❌ Error in TikTok command:', error);
        
        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        
        await sock.sendMessage(chatId, { 
            text: "❌ An error occurred while processing the request. Please try again later."
        }, { quoted: message });
    }
}

module.exports = tiktokCommand;