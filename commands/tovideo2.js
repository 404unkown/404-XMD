// /commands/tovideo2.js
const { audioToVideo, getExtensionFromMime } = require('../lib/mediaconverter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async function tovideo2Command(sock, chatId, message) {
    try {
        // Check if message is quoted
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: "*🎵 Please reply to an audio message*\n\nExample: Reply to audio with `.tovideo2`",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }

        // Check if quoted is audio
        const isAudio = !!quotedMsg.audioMessage;
        if (!isAudio) {
            await sock.sendMessage(chatId, {
                text: "*❌ Only audio messages can be converted to video*\nPlease reply to an audio message.",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }

        // Check duration (max 5 minutes = 300 seconds)
        const duration = quotedMsg.audioMessage?.seconds || 0;
        if (duration > 300) {
            await sock.sendMessage(chatId, {
                text: `*⏱️ Audio too long (max 5 minutes)*\nDuration: ${duration} seconds\n\nPlease use a shorter audio.`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }

        // Send processing message
        const processingMsg = await sock.sendMessage(chatId, {
            text: "*🔄 Downloading audio and preparing video...*\nThis may take a moment...",
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: message });

        // Download audio
        let audioBuffer;
        try {
            const stream = await downloadContentFromMessage(quotedMsg.audioMessage, 'audio');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            audioBuffer = Buffer.concat(chunks);
            
            if (!audioBuffer || audioBuffer.length === 0) {
                throw new Error('Downloaded empty audio');
            }
        } catch (error) {
            console.error('Audio download error:', error);
            throw new Error('Failed to download audio message');
        }

        // Update status
        await sock.sendMessage(chatId, {
            text: "*🔄 Converting audio to video...*\nThis may take a while depending on audio length.",
            edit: processingMsg.key
        });

        // Get audio extension
        const mimeType = quotedMsg.audioMessage?.mimetype || 'audio/mpeg';
        const audioExt = getExtensionFromMime(mimeType);

        // Convert to video
        const videoBuffer = await audioToVideo(audioBuffer, audioExt);

        // Send video
        await sock.sendMessage(chatId, {
            video: videoBuffer,
            caption: "🎵 Audio Visualized\nGenerated with .tovideo2 command",
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404TECH',
                    serverMessageId: 144
                }
            }
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('tovideo2 command error:', error);
        await sock.sendMessage(chatId, {
            text: `*❌ Failed to convert to video*\nError: ${error.message}\n\nPlease try again with a different audio.`,
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