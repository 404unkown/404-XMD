async function saveCommand(sock, chatId, message) {
    try {
        // Check if message is a reply
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) {
            return sock.sendMessage(chatId, {
                text: "*🍁 Please reply to a status/media message!*\nUsage: Reply to any media with .save"
            }, { quoted: message });
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '📤', key: message.key } 
        });

        let success = false;
        
        // Handle different media types
        if (quotedMessage.imageMessage) {
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await sock.sendMessage(chatId, {
                image: buffer,
                caption: quotedMessage.imageMessage.caption || '',
                mimetype: quotedMessage.imageMessage.mimetype || "image/jpeg"
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.videoMessage) {
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(quotedMessage.videoMessage, 'video');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await sock.sendMessage(chatId, {
                video: buffer,
                caption: quotedMessage.videoMessage.caption || '',
                mimetype: quotedMessage.videoMessage.mimetype || "video/mp4"
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.audioMessage) {
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(quotedMessage.audioMessage, 'audio');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await sock.sendMessage(chatId, {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: quotedMessage.audioMessage.ptt || false
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.stickerMessage) {
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await sock.sendMessage(chatId, {
                sticker: buffer,
                mimetype: quotedMessage.stickerMessage.mimetype || "image/webp"
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.documentMessage) {
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(quotedMessage.documentMessage, 'document');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await sock.sendMessage(chatId, {
                document: buffer,
                fileName: quotedMessage.documentMessage.fileName || "file",
                mimetype: quotedMessage.documentMessage.mimetype || "application/octet-stream"
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.conversation || quotedMessage.extendedTextMessage?.text) {
            // For text messages - send as forwarded
            const text = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;
            await sock.sendMessage(chatId, {
                text: `💬 *Saved Text:*\n\n${text}`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true
                }
            }, { quoted: message });
            success = true;
        }

        if (success) {
            // Success reaction
            await sock.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });
        } else {
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            sock.sendMessage(chatId, {
                text: "❌ This message type is not supported for saving"
            }, { quoted: message });
        }

    } catch (error) {
        console.error("Save Error:", error);
        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        sock.sendMessage(chatId, {
            text: "❌ Error saving message:\n" + error.message
        }, { quoted: message });
    }
}

module.exports = { saveCommand };