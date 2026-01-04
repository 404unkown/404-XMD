const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function webzipCommand(sock, chatId, message, args) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text.split(' ').slice(1).join(' ').trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "🌐 *WebZIP - Website Archiver*\n\nPlease provide a website URL.\n\nExample: .webzip https://example.com\n\n✨ *Features:*\n• Full page archives\n• Single HTML files\n• PDF conversions\n• Screenshots"
            });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Invalid URL format.\n\nPlease provide a valid URL starting with http:// or https://"
            });
        }

        // Send processing message
        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        // Send initial status
        const statusMsg = await sock.sendMessage(chatId, {
            text: `⏳ *Processing Website Archive*\n\n🌐 ${url}\n\n🔄 Checking archiving services...`
        });

        // ====== TRY MULTIPLE WEB ARCHIVING METHODS ======
        let result = null;
        let methodUsed = "";

        // METHOD 1: SingleFile CLI API (Best for HTML)
        if (!result) {
            try {
                await sock.sendMessage(chatId, {
                    text: `⏳ *Method 1/4:* SingleFile API\n\nDownloading as self-contained HTML...`
                }, { quoted: statusMsg });
                
                const singleFileApi = `https://singlefile-psi.vercel.app/?url=${encodeURIComponent(url)}`;
                const response = await axios.get(singleFileApi, { 
                    timeout: 45000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    }
                });
                
                if (response.data?.downloadUrl) {
                    result = {
                        type: 'html',
                        url: response.data.downloadUrl,
                        size: response.data.size || 'Unknown'
                    };
                    methodUsed = "SingleFile API";
                    console.log('✅ SingleFile API successful');
                }
            } catch (error) {
                console.log('Method 1 failed:', error.message);
            }
        }

        // METHOD 2: PDF Conversion (Alternative)
        if (!result) {
            try {
                await sock.sendMessage(chatId, {
                    text: `⏳ *Method 2/4:* PDF Conversion\n\nConverting to PDF...`
                }, { quoted: statusMsg });
                
                // Using html2pdf API
                const pdfApi = `https://api.html2pdf.app/v1/generate?url=${encodeURIComponent(url)}&apiKey=YOUR_API_KEY`;
                const pdfResponse = await axios.get(pdfApi, { 
                    responseType: 'arraybuffer',
                    timeout: 45000 
                });
                
                if (pdfResponse.data && pdfResponse.data.length > 0) {
                    const domain = new URL(url).hostname.replace('www.', '');
                    const filename = `${domain}_${Date.now()}.pdf`;
                    
                    // Send as PDF
                    await sock.sendMessage(chatId, {
                        document: pdfResponse.data,
                        fileName: filename,
                        mimetype: 'application/pdf',
                        caption: `📄 *Website PDF Export*\n\n🌐 ${url}\n📁 Format: PDF\n📦 ${(pdfResponse.data.length / 1024).toFixed(2)}KB\n\n✨ *Exported by 404-XMD*\n⚠️ Some interactive elements may be lost`
                    });
                    
                    await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                    return;
                }
            } catch (error) {
                console.log('Method 2 failed:', error.message);
            }
        }

        // METHOD 3: Simple HTML Download (Fallback)
        if (!result) {
            try {
                await sock.sendMessage(chatId, {
                    text: `⏳ *Method 3/4:* Simple HTML Download\n\nDownloading raw HTML...`
                }, { quoted: statusMsg });
                
                const response = await axios.get(url, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    }
                });
                
                const htmlContent = response.data;
                const domain = new URL(url).hostname.replace('www.', '');
                const filename = `${domain}_${Date.now()}.html`;
                
                // Send as HTML file
                await sock.sendMessage(chatId, {
                    document: Buffer.from(htmlContent, 'utf8'),
                    fileName: filename,
                    mimetype: 'text/html',
                    caption: `📄 *Webpage HTML*\n\n🌐 ${url}\n📁 Raw HTML\n📦 ${(htmlContent.length / 1024).toFixed(2)}KB\n\n⚠️ *Note:* External resources are not included.\n✨ *Downloaded by 404-XMD*`
                });
                
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
                
            } catch (error) {
                console.log('Method 3 failed:', error.message);
            }
        }

        // METHOD 4: Screenshot API (Visual Archive)
        if (!result) {
            try {
                await sock.sendMessage(chatId, {
                    text: `⏳ *Method 4/4:* Screenshot Capture\n\nTaking full-page screenshot...`
                }, { quoted: statusMsg });
                
                // Using screenshotapi.net (free tier available)
                const screenshotApi = `https://screenshotapi.net/api/v1/screenshot?url=${encodeURIComponent(url)}&token=YOUR_TOKEN`;
                const screenshotResponse = await axios.get(screenshotApi, { 
                    responseType: 'arraybuffer',
                    timeout: 45000 
                });
                
                if (screenshotResponse.data && screenshotResponse.data.length > 0) {
                    const domain = new URL(url).hostname.replace('www.', '');
                    const filename = `${domain}_screenshot_${Date.now()}.png`;
                    
                    // Send as image
                    await sock.sendMessage(chatId, {
                        image: screenshotResponse.data,
                        caption: `📸 *Website Screenshot*\n\n🌐 ${url}\n📁 Visual archive\n📦 ${(screenshotResponse.data.length / 1024).toFixed(2)}KB\n\n✨ *Captured by 404-XMD*\n⚠️ Dynamic content may not be captured`
                    });
                    
                    await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                    return;
                }
            } catch (error) {
                console.log('Method 4 failed:', error.message);
            }
        }

        // ====== SUCCESS: Send SingleFile Result ======
        if (result && result.type === 'html') {
            try {
                await sock.sendMessage(chatId, {
                    text: `✅ *Website Archive Complete*\n\n🌐 ${url}\n📁 Format: Self-contained HTML\n⚡ Method: ${methodUsed}\n\n⏳ *Downloading archive file...*`
                }, { quoted: statusMsg });
                
                // Download the SingleFile HTML
                const fileResponse = await axios.get(result.url, {
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                
                const domain = new URL(url).hostname.replace('www.', '');
                const filename = `${domain}_full_${Date.now()}.html`;
                
                await sock.sendMessage(chatId, {
                    document: fileResponse.data,
                    fileName: filename,
                    mimetype: 'text/html',
                    caption: `📦 *Complete Website Archive*\n\n🌐 ${url}\n📁 SingleFile HTML\n📦 ${(fileResponse.data.length / 1024).toFixed(2)}KB\n⚡ All assets embedded\n\n✨ *Archived by 404-XMD*\n💡 Open in browser to view perfectly`
                });
                
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
                
            } catch (fileError) {
                console.log('File download failed:', fileError.message);
                // Provide the direct link as fallback
                await sock.sendMessage(chatId, {
                    text: `📦 *Archive Ready*\n\n🌐 ${url}\n⚡ Method: ${methodUsed}\n\n🔗 *Direct Download Link:*\n${result.url}\n\n💡 *Copy this link to download the archive file.*`
                });
                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
            }
        }

        // ====== ALL METHODS FAILED ======
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        
        await sock.sendMessage(chatId, {
            text: `❌ *Archiving Failed*\n\n🌐 ${url}\n\n🔧 *All methods failed. Possible reasons:*\n• Website blocks archiving\n• Requires JavaScript/Login\n• Server timeout\n• Service limits\n\n💡 *Manual alternatives:*\n1. https://web.archive.org/save/${url}\n2. Browser: Ctrl+S or File > Save Page\n3. Extension: "SingleFile" for Chrome/Firefox`
        }, { quoted: statusMsg });

    } catch (error) {
        console.error('WebZIP error:', error);
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        await sock.sendMessage(chatId, {
            text: `❌ *Unexpected Error*\n\nError: ${error.message}\n\n💡 Try again or use a different website.`
        });
    }
}

module.exports = { webzipCommand };