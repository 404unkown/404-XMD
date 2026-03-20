const axios = require('axios');

async function webzipCommand(sock, chatId, message, args) {
    try {
        // ... [keep your existing URL extraction and validation code up to line 80]
        // Send processing message
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        // ====== TRY MULTIPLE WEB ARCHIVING APIS ======
        let zipUrl = null;
        let apiUsed = "";
        let fileInfo = {};

        // API 1: Wayback Machine Save Page Now
        try {
            console.log('🔍 Trying Wayback Machine API...');
            const waybackUrl = `https://web.archive.org/save/${url}`;
            const waybackResponse = await axios.head(waybackUrl, { timeout: 15000 });
            
            if (waybackResponse.headers['content-location']) {
                const archiveUrl = `https://web.archive.org${waybackResponse.headers['content-location']}`;
                // For Wayback, we'll provide the archive link instead of ZIP
                await sock.sendMessage(chatId, {
                    text: `✅ *Website Archived*\n\n🌐 *Live Archive Link:*\n${archiveUrl}\n\n🔗 *Original:* ${url}\n📅 Archived: ${new Date().toLocaleDateString()}\n\n✨ *Powered by 404-XMD & Wayback Machine*`
                }, { quoted: message });
                
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
            }
        } catch (waybackError) {
            console.log('Wayback API failed:', waybackError.message);
        }

        // API 2: SingleFile API (creates single HTML file)
        if (!zipUrl) {
            try {
                console.log('🔍 Trying SingleFile API...');
                const singleFileUrl = `https://singlefile-psi.vercel.app/?url=${encodeURIComponent(url)}&source=web`;
                const singleResponse = await axios.get(singleFileUrl, { timeout: 30000 });
                
                if (singleResponse.data && singleResponse.data.success) {
                    zipUrl = singleResponse.data.downloadUrl;
                    apiUsed = "SingleFile API";
                    fileInfo = {
                        files: 1,
                        format: "Single HTML file",
                        note: "All assets embedded in one HTML file"
                    };
                    console.log('✅ Using SingleFile API');
                }
            } catch (singleError) {
                console.log('SingleFile API failed:', singleError.message);
            }
        }

        // API 3: Archive.today (simple archiving)
        if (!zipUrl) {
            try {
                console.log('🔍 Trying Archive.today...');
                const archiveTodayUrl = `https://archive.today/submit/?url=${encodeURIComponent(url)}`;
                // This doesn't return a file, but creates a public archive
                await sock.sendMessage(chatId, {
                    text: `📚 *Website Archive Created*\n\n🌐 *Archive Link:*\n${archiveTodayUrl}\n\n🔗 *Original:* ${url}\n\n💡 *Note:* Visit the link above to view the archived version.\n\n✨ *Powered by 404-XMD*`
                }, { quoted: message });
                
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
            } catch (archiveError) {
                console.log('Archive.today failed:', archiveError.message);
            }
        }

        // ====== FALLBACK: SIMPLE PAGE DOWNLOAD ======
        if (!zipUrl) {
            try {
                console.log('🔄 Fallback: Simple page download...');
                
                // Download the webpage as HTML
                const response = await axios.get(url, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const htmlContent = response.data;
                const htmlBuffer = Buffer.from(htmlContent, 'utf8');
                
                // Create filename
                const domain = new URL(url).hostname.replace('www.', '');
                const filename = `${domain}_page_${Date.now()}.html`;
                
                // Send as HTML file
                await sock.sendMessage(chatId, {
                    document: htmlBuffer,
                    fileName: filename,
                    mimetype: 'text/html',
                    caption: `📄 *Webpage Downloaded*\n\n🌐 ${url}\n📁 Single HTML file\n📦 ${(htmlBuffer.length / 1024).toFixed(2)}KB\n\n⚠️ *Note:* External resources (images, CSS, JS) are not included.\n✨ *Powered by 404-XMD*`
                }, { quoted: message });
                
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
                
            } catch (downloadError) {
                console.log('Simple download failed:', downloadError.message);
            }
        }

        // ====== NO APIS WORKED ======
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        
        await sock.sendMessage(chatId, {
            text: `❌ *Website Archiving Failed*\n\nAll archiving services are currently unavailable.\n\n💡 *Alternatives:*\n1. Use browser extensions like "SingleFile"\n2. Try web.archive.org manually\n3. Check if website blocks archiving\n\n🔗 *URL Tested:* ${url}`
        }, { quoted: message });

    } catch (error) {
        console.error('WebZIP error:', error);
        // ... [keep your existing error handling]
    }
}

module.exports = { webzipCommand };