const axios = require("axios");

module.exports = async (sock, chatId, message, rawText) => {
    try {
        const args = rawText.trim().split(' ');
        const url = args[1];
        
        if (!url) {
            await sock.sendMessage(chatId, {
                text: "🌐 *Website Screenshot*\n\nPlease provide a website URL\n\n*Example:* .screenshot https://github.com\n.screenshot https://google.com\n\n*Aliases:* .ss, .ssweb"
            }, { quoted: message });
            return;
        }

        // Validate URL
        let validUrl = url.trim();
        if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
            validUrl = "https://" + validUrl;
        }

        try {
            new URL(validUrl);
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: "❌ Invalid URL format\n\nPlease provide a valid website URL\n*Example:* .screenshot https://example.com"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await sock.sendMessage(chatId, {
            text: `📸 *Capturing screenshot...*\n\nWebsite: ${validUrl}\n\nThis may take 10-15 seconds.`
        }, { quoted: message });

        let screenshotUrl = null;
        let serviceUsed = "";
        
        // ====== TRY MULTIPLE SCREENSHOT SERVICES ======
        
        // SERVICE 1: Thum.io (Original)
        try {
            const thumUrl = `https://image.thum.io/get/fullpage/${encodeURIComponent(validUrl)}`;
            console.log("Trying Thum.io:", thumUrl);
            
            // Test if URL is accessible
            const testResponse = await axios.head(thumUrl, { timeout: 10000 });
            if (testResponse.status === 200) {
                screenshotUrl = thumUrl;
                serviceUsed = "Thum.io";
                console.log("✅ Using Thum.io");
            }
        } catch (thumError) {
            console.log("Thum.io failed:", thumError.message);
        }

        // SERVICE 2: ScreenshotAPI.net
        if (!screenshotUrl) {
            try {
                // You can get a free API key from https://screenshotapi.net
                const screenshotApiKey = 'YOUR_API_KEY_HERE'; // Optional
                const apiUrl = screenshotApiKey ? 
                    `https://shot.screenshotapi.net/screenshot?url=${encodeURIComponent(validUrl)}&width=1280&height=720&output=image&file_type=png&delay=2000&token=${screenshotApiKey}` :
                    `https://shot.screenshotapi.net/screenshot?url=${encodeURIComponent(validUrl)}&width=1280&height=720&output=image&file_type=png&delay=2000`;
                
                const testResponse = await axios.head(apiUrl, { timeout: 10000 });
                if (testResponse.status === 200) {
                    screenshotUrl = apiUrl;
                    serviceUsed = "ScreenshotAPI.net";
                    console.log("✅ Using ScreenshotAPI.net");
                }
            } catch (apiError) {
                console.log("ScreenshotAPI.net failed:", apiError.message);
            }
        }

        // SERVICE 3: Page2Images (Free alternative)
        if (!screenshotUrl) {
            try {
                const page2imagesUrl = `https://api.page2images.com/restfullink?p2i_url=${encodeURIComponent(validUrl)}&p2i_key=YOUR_KEY_HERE`;
                // Note: Requires API key from https://www.page2images.com
                console.log("Skipping Page2Images (requires API key)");
            } catch (page2Error) {
                console.log("Page2Images not configured");
            }
        }

        // SERVICE 4: Simple screenshot via browserless (if self-hosted)
        if (!screenshotUrl) {
            try {
                // This requires running browserless.io or similar service
                // const browserlessUrl = `http://localhost:3000/screenshot?url=${encodeURIComponent(validUrl)}`;
                // Uncomment and configure if you run your own screenshot service
                console.log("Browserless not configured");
            } catch (browserlessError) {
                console.log("Browserless not available");
            }
        }

        // SERVICE 5: Free alternative - ScreenshotLayer (limited)
        if (!screenshotUrl) {
            try {
                // Free tier: 100 screenshots/month
                const accessKey = 'YOUR_ACCESS_KEY_HERE'; // Get from https://screenshotlayer.com
                const secretWord = 'YOUR_SECRET_WORD_HERE';
                const screenshotLayerUrl = `https://api.screenshotlayer.com/api/capture?access_key=${accessKey}&url=${encodeURIComponent(validUrl)}&viewport=1440x900&fullpage=1`;
                
                console.log("ScreenshotLayer requires API key");
            } catch (layerError) {
                console.log("ScreenshotLayer not configured");
            }
        }

        // ====== NO SERVICE WORKED ======
        if (!screenshotUrl) {
            await sock.sendMessage(chatId, { delete: processingMsg.key });
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            
            return await sock.sendMessage(chatId, {
                text: `❌ *All screenshot services failed*\n\nCould not capture screenshot of:\n${validUrl}\n\n💡 *Possible reasons:*\n• Website blocks screenshot tools\n• Rate limits exceeded\n• Services temporarily down\n\n🔧 *Alternatives:*\n1. Try later\n2. Use browser extensions\n3. Try a different URL`
            }, { quoted: message });
        }

        // ====== SEND SCREENSHOT ======
        try {
            // Delete processing message
            await sock.sendMessage(chatId, { delete: processingMsg.key });

            // Send the screenshot
            await sock.sendMessage(chatId, {
                image: { url: screenshotUrl },
                caption: `🌐 *Website Screenshot*\n\n🔗 *URL:* ${validUrl}\n📱 *Service:* ${serviceUsed}\n📏 *Full page capture*\n\n🤖 *Powered by 404-XMD*`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    externalAdReply: {
                        title: "Website Screenshot",
                        body: `Captured via ${serviceUsed}`,
                        mediaType: 1,
                        thumbnailUrl: screenshotUrl,
                        sourceUrl: validUrl
                    }
                }
            }, { quoted: message });

            // Success reaction
            await sock.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (sendError) {
            console.error('Send error:', sendError);
            await sock.sendMessage(chatId, { delete: processingMsg.key });
            
            await sock.sendMessage(chatId, {
                text: `❌ *Failed to send screenshot*\n\nError: ${sendError.message}\n\n*Raw screenshot URL:*\n${screenshotUrl}\n\nYou can visit the URL manually.`
            }, { quoted: message });

            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }

    } catch (error) {
        console.error('Screenshot command error:', error);
        
        let errorMsg = "❌ Failed to capture screenshot.";
        
        if (error.message.includes("timeout")) {
            errorMsg = "⏳ Website took too long to load.";
        } else if (error.message.includes("ENOTFOUND")) {
            errorMsg = "🌐 Website not found or unreachable.";
        } else if (error.message.includes("ECONNREFUSED")) {
            errorMsg = "🚫 Connection refused by website.";
        } else if (error.message.includes("certificate")) {
            errorMsg = "🔒 SSL certificate error.";
        }

        errorMsg += `\n\n*Error:* ${error.message}\n\n*Usage:* .screenshot <url>`;

        await sock.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};