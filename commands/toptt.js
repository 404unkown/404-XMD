// /commands/toptt.js
const { toPTT, getExtensionFromMime } = require('../lib/mediaconverter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async function topttCommand(sock, chatId, message) {
    try {
        // Check if message is quoted
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: "*🗣️ Please reply to a video or audio message*\n\nExample: Reply to video with `.toptt`",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }

        // Check if quoted is video or audio
        const isVideo = !!quotedMsg.videoMessage;
        const isAudio = !!quotedMsg.audioMessage;
        
        if (!isVideo && !isAudio) {
            await sock.sendMessage(chatId, {
                text: "*❌ Only video or audio messages can be converted*\nPlease reply to a video or audio message.",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }

        // Check duration (max 1 minute = 60 seconds for PTT)
        const media = isVideo ? quotedMsg.videoMessage : quotedMsg.audioMessage;
        const duration = media?.seconds || 0;
        if (duration > 60) {
            await sock.sendMessage(chatId, {
                text: `*⏱️ Media too long for voice note (max 1 minute)*\nDuration: ${duration} seconds\n\nPlease use shorter media.`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }

        // Send processing message
        await sock.sendMessage(chatId, {
            text: "*🔄 Converting to voice message...*",
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: message });

        // Download media
        let mediaBuffer;
        try {
            const mediaType = isVideo ? 'video' : 'audio';
            const stream = await downloadContentFromMessage(media, mediaType);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            mediaBuffer = Buffer.concat(chunks);
            
            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('Downloaded empty media');
            }
        } catch (error) {
            console.error('Media download error:', error);
            throw new Error('Failed to download media');
        }

        // Get extension
        const mimeType = media?.mimetype || (isVideo ? 'video/mp4' : 'audio/mpeg');
        const mediaExt = getExtensionFromMime(mimeType);

        // Convert to PTT (voice note)
        const pttBuffer = await toPTT(mediaBuffer, mediaExt);

        // Send as voice note
        await sock.sendMessage(chatId, {
            audio: pttBuffer,
            ptt: true, // This makes it a voice note
            mimetype: 'audio/ogg; codecs=opus',
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420656466131@newsletter',
                    newsletterName: 'Lucky Tech Hub',
                    serverMessageId: 146
                }
            }
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('toptt command error:', error);
        await sock.sendMessage(chatId, {
            text: `*❌ Failed to create voice message*\nError: ${error.message}`,
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