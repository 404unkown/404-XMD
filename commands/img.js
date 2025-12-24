const axios = require('axios');

module.exports = async function imgCommand(sock, chatId, message, args) {
    const query = args.join(" ").trim();

    if (!query) {
        await sock.sendMessage(chatId, {
            text: "🖼️ *Image Search*\n\nPlease provide a search query.\n\n*Example:* .img cute cats"
        }, { quoted: message });
        return;
    }

    try {
        const processingMsg = await sock.sendMessage(chatId, {
            text: `🔍 *Searching for:* "${query}"\n\n⏳ This may take a moment...`
        }, { quoted: message });

        let imageUrls = [];
        let apiName = "";
        let apiSuccess = false;

        // ====== Strategy 1: Try Public APIs ======

        // API Option A: Dog CEO (for dog pics - fast and reliable for testing)
        if (query.toLowerCase().includes('dog') || query.toLowerCase().includes('puppy') || query.toLowerCase().includes('canine')) {
            try {
                const breed = query.toLowerCase().replace('dog', '').replace('puppy', '').replace('canine', '').trim() || 'random';
                const dogUrl = `https://dog.ceo/api/breed/${breed}/images/random/5`;
                const dogResponse = await axios.get(dogUrl, { timeout: 8000 });

                if (dogResponse.data?.status === 'success' && dogResponse.data.message?.length > 0) {
                    imageUrls = dogResponse.data.message.slice(0, 5);
                    apiSuccess = true;
                    apiName = "Dog CEO API";
                    console.log("✅ Using Dog CEO API");
                }
            } catch (dogError) {
                console.log("Dog API failed or no match, trying general search...");
            }
        }

        // API Option B: Lorem Picsum (for placeholder images)
        if (!apiSuccess) {
            try {
                // Picsum doesn't have search, but we can get random images
                // We'll use query to determine image properties
                const seed = query.replace(/\s+/g, '-').toLowerCase().substring(0, 20);
                const picsumUrls = [];
                for (let i = 0; i < 5; i++) {
                    const width = 400 + Math.floor(Math.random() * 300);
                    const height = 300 + Math.floor(Math.random() * 300);
                    picsumUrls.push(`https://picsum.photos/seed/${seed}${i}/${width}/${height}`);
                }
                imageUrls = picsumUrls;
                apiSuccess = true;
                apiName = "Lorem Picsum";
                console.log("✅ Using Lorem Picsum");
            } catch (picsumError) {
                console.log("Picsum approach failed");
            }
        }

        // API Option C: DuckDuckGo Instant Answer API (has images)
        if (!apiSuccess) {
            try {
                const duckUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&iax=images&ia=images`;
                const duckResponse = await axios.get(duckUrl, { timeout: 10000 });

                if (duckResponse.data?.RelatedTopics?.length > 0) {
                    const topics = duckResponse.data.RelatedTopics.filter(topic => topic.Icon?.URL);
                    imageUrls = topics.map(topic => `https://duckduckgo.com${topic.Icon.URL}`).slice(0, 5);
                    apiSuccess = true;
                    apiName = "DuckDuckGo";
                    console.log("✅ Using DuckDuckGo API");
                }
            } catch (duckError) {
                console.log("DuckDuckGo API failed");
            }
        }

        // API Option D: Simple Google Images Proxy (using public CORS proxy)
        if (!apiSuccess) {
            try {
                // Using a CORS proxy to access Google Images
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www.google.com/search?q=${query}&tbm=isch`)}`;
                const proxyResponse = await axios.get(proxyUrl, { timeout: 12000 });

                // Parse HTML for image URLs (simplified regex approach)
                const html = proxyResponse.data;
                const imageMatches = html.match(/https:\/\/[^"']*\.(jpg|jpeg|png|gif|webp)/gi) || [];

                if (imageMatches.length > 0) {
                    // Filter for actual image URLs and remove duplicates
                    imageUrls = [...new Set(imageMatches
                        .filter(url => !url.includes('googlelogo') && !url.includes('gstatic'))
                        .slice(0, 10)
                    )];
                    apiSuccess = true;
                    apiName = "Google Images";
                    console.log("✅ Using Google Images via proxy");
                }
            } catch (proxyError) {
                console.log("Google proxy method failed:", proxyError.message);
            }
        }

        // ====== Strategy 2: Fallback to Original API ======
        if (!apiSuccess) {
            try {
                const originalUrl = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
                const originalResponse = await axios.get(originalUrl, { timeout: 15000 });

                if (originalResponse.data?.success && originalResponse.data.results?.length > 0) {
                    imageUrls = originalResponse.data.results.slice(0, 10);
                    apiSuccess = true;
                    apiName = "Google Image Search";
                    console.log("✅ Using original DavidCyrilTech API");
                }
            } catch (originalError) {
                console.log("Original API also failed");
            }
        }

        // ====== Strategy 3: Ultimate Fallback ======
        if (!apiSuccess) {
            // Use Catbox or other static image as last resort
            const catboxImages = [
                'https://files.catbox.moe/i6xi1s.png',
                'https://files.catbox.moe/01f9y1.jpg',
                'https://files.catbox.moe/852x91.jpeg',
                'https://files.catbox.moe/hlh1f3.png',
                'https://files.catbox.moe/byf7pu.jpeg'
            ];
            imageUrls = catboxImages;
            apiSuccess = true;
            apiName = "404-XMD Gallery";
            console.log("✅ Using Catbox fallback images");
        }

        // ====== Send Results ======
        await sock.sendMessage(chatId, { delete: processingMsg.key });

        if (!imageUrls.length) {
            await sock.sendMessage(chatId, {
                text: `❌ *No images found for:* "${query}"\n\nTry simpler keywords.`
            }, { quoted: message });
            return;
        }

        // Send summary
        await sock.sendMessage(chatId, {
            text: `✅ *Found images for:* "${query}"\n📡 *Source:* ${apiName}\n🎯 *Sending ${Math.min(5, imageUrls.length)} results...*`
        }, { quoted: message });

        // Send images (max 5)
        const sender = message.key.participant || message.key.remoteJid;
        const imagesToSend = imageUrls.slice(0, 5);
        let imagesSent = 0;

        for (const imgUrl of imagesToSend) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await sock.sendMessage(chatId, {
                    image: { url: imgUrl },
                    caption: `📷 *Image ${imagesSent + 1}/${imagesToSend.length}*\n🔍 *Query:* ${query}\n👤 *By:* @${sender.split('@')[0]}\n✨ *404-XMD*`,
                    contextInfo: { 
                        mentionedJid: [sender],
                        forwardingScore: 1,
                        isForwarded: true
                    }
                });
                
                imagesSent++;
            } catch (imgError) {
                console.warn(`⚠️ Failed to send image ${imagesSent + 1}:`, imgError.message);
            }
        }

        if (imagesSent > 0) {
            await sock.sendMessage(chatId, {
                text: `🎉 *Sent ${imagesSent} images for:* "${query}"\n\n✨ *Powered by 404-XMD*`
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Image command error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *Search failed*\nError: ${error.message}\n\nTry again later.`
        }, { quoted: message });
    }
};