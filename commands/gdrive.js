const axios = require('axios');

module.exports = async function gdriveCommand(sock, chatId, message, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: "📥 *Google Drive Downloader*\n\n📝 *Usage:* .gdrive [google-drive-url]\n\nExample: `.gdrive https://drive.google.com/file/d/...`",
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

        const gdriveUrl = args[0];
        
        // Validate Google Drive URL
        if (!gdriveUrl.includes("drive.google.com")) {
            await sock.sendMessage(chatId, {
                text: "❌ *Invalid Google Drive URL*\n\nPlease provide a valid Google Drive link.\nExample: https://drive.google.com/file/d/...",
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

        // Prepare API request
        const apiUrl = 'https://api.nexoracle.com/downloader/gdrive';
        const params = {
            apikey: 'free_key@maher_apis',
            url: gdriveUrl
        };

        // Get file info from API
        const response = await axios.get(apiUrl, { params });
        
        if (!response.data || response.data.status !== 200 || !response.data.result) {
            throw new Error('API response error');
        }

        const { downloadUrl, fileName, fileSize, mimetype } = response.data.result;

        // Send downloading message
        await sock.sendMessage(chatId, {
            text: `📥 *Downloading File*\n\n📁 *Name:* ${fileName}\n📊 *Size:* ${fileSize}\n⏳ *Status:* Downloading...`,
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

        // Download the file
        const fileResponse = await axios.get(downloadUrl, { 
            responseType: 'arraybuffer',
            timeout: 300000 // 5 minutes timeout for large files
        });

        if (!fileResponse.data) {
            throw new Error('Failed to download file');
        }

        const fileBuffer = Buffer.from(fileResponse.data, 'binary');

        // Prepare common caption
        const caption = `📥 *Google Drive Download*\n\n` +
                       `📁 *File Name:* ${fileName}\n` +
                       `📊 *File Size:* ${fileSize}\n` +
                       `📄 *Type:* ${mimetype}\n\n` +
                       `🔗 *Source:* Google Drive\n` +
                       `💡 *Powered by 404 TECH*`;

        // Send file based on type
        if (mimetype.startsWith('image/')) {
            await sock.sendMessage(chatId, {
                image: fileBuffer,
                caption: caption,
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
        else if (mimetype.startsWith('video/')) {
            await sock.sendMessage(chatId, {
                video: fileBuffer,
                caption: caption,
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
        else if (mimetype.startsWith('audio/')) {
            await sock.sendMessage(chatId, {
                audio: fileBuffer,
                mimetype: mimetype,
                caption: caption,
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
        else {
            // Send as document
            await sock.sendMessage(chatId, {
                document: fileBuffer,
                fileName: fileName,
                mimetype: mimetype,
                caption: caption,
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

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('❌ Google Drive download error:', error.message);
        
        let errorMessage = '❌ *Download Failed*\n\n';
        
        if (error.response?.status === 404) {
            errorMessage += 'File not found or link is invalid.';
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage += 'Service temporarily unavailable.';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage += 'Download timeout. File might be too large.';
        } else {
            errorMessage += 'Please check the link and try again.';
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