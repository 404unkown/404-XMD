const { sticker } = require('../lib/sticker.js');
const uploadFile = require('../lib/uploadFile.js');
const uploadImage = require('../lib/uploadImage.js');
const { webp2png, webp2pngLocal } = require('../lib/webp2mp4.js');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Helper function to check if text is a URL
function isUrl(text) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4|webp)/i;
    return urlRegex.test(text);
}

async function stickerCommand(sock, chatId, message, args) {
    try {
        // Send processing reaction
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        
        let stickerBuffer = false;
        
        // Check if message is replying to media
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (quotedMsg) {
            // Check what type of media is quoted
            const isImage = !!quotedMsg.imageMessage;
            const isVideo = !!quotedMsg.videoMessage;
            const isSticker = !!quotedMsg.stickerMessage;
            
            if (isImage || isVideo || isSticker) {
                let mediaBuffer;
                let mediaType = isImage ? 'image' : (isVideo ? 'video' : 'sticker');
                
                try {
                    // Download the media
                    const stream = await downloadContentFromMessage(
                        isImage ? quotedMsg.imageMessage : 
                        isVideo ? quotedMsg.videoMessage : 
                        quotedMsg.stickerMessage, 
                        mediaType
                    );
                    
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    mediaBuffer = Buffer.concat(chunks);
                    
                    if (!mediaBuffer || mediaBuffer.length === 0) {
                        throw new Error('Failed to download media');
                    }
                    
                    // Check video duration (max 7 seconds)
                    if (isVideo && quotedMsg.videoMessage?.seconds > 7) {
                        await sock.sendMessage(chatId, {
                            text: '❌ *Video too long!*\n\nMaximum video duration is 7 seconds.',
                            ...(global.channelInfo || {})
                        }, { quoted: message });
                        return;
                    }
                    
                    // For stickers, convert WebP to PNG first
                    if (isSticker) {
                        try {
                            // Use local conversion first (faster)
                            mediaBuffer = await webp2pngLocal(mediaBuffer);
                        } catch (conversionError) {
                            console.log('Local conversion failed, trying external service...');
                            // Fallback to external service
                            const pngUrl = await webp2png(mediaBuffer);
                            stickerBuffer = await sticker(null, pngUrl, global.packname || "My Pack", global.author || "Me");
                        }
                    }
                    
                    // If we don't have stickerBuffer yet (not from external service)
                    if (!stickerBuffer) {
                        // Try to create sticker directly from buffer
                        try {
                            stickerBuffer = await sticker(mediaBuffer, null, global.packname || "My Pack", global.author || "Me");
                        } catch (stickerError) {
                            console.log('Direct sticker creation failed, trying upload method...');
                            
                            // Upload media and create sticker from URL
                            let uploadedUrl;
                            if (isVideo) {
                                uploadedUrl = await uploadFile(mediaBuffer);
                            } else {
                                uploadedUrl = await uploadImage(mediaBuffer);
                            }
                            
                            stickerBuffer = await sticker(null, uploadedUrl, global.packname || "My Pack", global.author || "Me");
                        }
                    }
                    
                } catch (downloadError) {
                    console.error('Media processing error:', downloadError);
                    throw new Error('Failed to process media. Try again.');
                }
            } else {
                // Not an image, video, or sticker
                await sock.sendMessage(chatId, {
                    text: `❌ *Unsupported media type!*\n\nPlease reply to an image, video, or sticker.\n\n*Supported:*\n• Images (JPG, PNG, GIF)\n• Videos (max 7 seconds)\n• Stickers`,
                    ...(global.channelInfo || {})
                }, { quoted: message });
                return;
            }
        } 
        // Check if args contain a URL
        else if (args.length > 0 && isUrl(args[0])) {
            const url = args[0].trim();
            stickerBuffer = await sticker(null, url, global.packname || "My Pack", global.author || "Me");
        }
        // No media or URL provided
        else {
            await sock.sendMessage(chatId, {
                text: `🎨 *Sticker Maker*\n\n*Usage:*\n• Reply to an image/video/sticker: ${global.PREFIX || '.'}s\n• With URL: ${global.PREFIX || '.'}s https://image-url.jpg\n\n*Supported formats:* JPG, PNG, GIF, WebP, MP4 (max 7 sec)\n*Aliases:* ${global.PREFIX || '.'}sticker, ${global.PREFIX || '.'}stiker`,
                ...(global.channelInfo || {})
            }, { quoted: message });
            
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return;
        }
        
        if (!stickerBuffer) {
            throw new Error('Failed to create sticker from the provided media');
        }
        
        // Send the sticker
        await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
            mimetype: 'image/webp'
        }, { quoted: message });
        
        // Success reaction
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        
    } catch (error) {
        console.error('Sticker command error:', error);
        
        let errorMessage = '❌ Failed to create sticker!';
        
        if (error.message.includes('Failed to download')) {
            errorMessage = '❌ Failed to download media. Try again.';
        } else if (error.message.includes('Video too long')) {
            errorMessage = '❌ Video must be 7 seconds or less.';
        } else if (error.message.includes('Invalid URL')) {
            errorMessage = '❌ Invalid image URL provided.';
        } else if (error.message.includes('unsupported format')) {
            errorMessage = '❌ Unsupported media format. Use JPG, PNG, GIF, or WebP.';
        } else if (error.message.includes('Conversion failed')) {
            errorMessage = '❌ Failed to convert media. Try a different image.';
        }
        
        await sock.sendMessage(chatId, {
            text: `${errorMessage}\n\n_Error: ${error.message}_`,
            ...(global.channelInfo || {})
        }, { quoted: message });
        
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

module.exports = stickerCommand;