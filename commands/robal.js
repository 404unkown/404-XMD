const { addExif } = require('../lib/sticker.js');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function robalCommand(sock, chatId, message, args) {
    try {
        // Check if message is replying to a sticker
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg?.stickerMessage) {
            await sock.sendMessage(chatId, {
                text: `❌ *Usage:*\nReply to a sticker with:\n${global.PREFIX || '.'}robal packname|author\n\n*Example:*\n${global.PREFIX || '.'}robal My Pack|My Bot\n\nOr just: ${global.PREFIX || '.'}robal My Pack (author will be default)`,
                ...(global.channelInfo || {})
            }, { quoted: message });
            return;
        }
        
        // Send processing reaction
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        
        let packname = '';
        let author = '';
        
        // Parse packname and author from text
        if (args.length > 0) {
            const text = args.join(' ');
            if (text.includes('|')) {
                const parts = text.split('|');
                packname = parts[0].trim();
                author = parts.slice(1).join('|').trim();
            } else {
                packname = text.trim();
                author = global.author || 'Bot'; // Use default author if not provided
            }
        } else {
            // Use defaults if no arguments
            packname = global.packname || 'My Pack';
            author = global.author || 'Me';
        }
        
        // Download the sticker
        let stickerBuffer;
        try {
            const stream = await downloadContentFromMessage(quotedMsg.stickerMessage, 'sticker');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            stickerBuffer = Buffer.concat(chunks);
            
            if (!stickerBuffer || stickerBuffer.length === 0) {
                throw new Error('Failed to download sticker');
            }
        } catch (downloadError) {
            console.error('Sticker download error:', downloadError);
            throw new Error('Failed to download sticker image');
        }
        
        // Check if it's a WebP sticker
        const mimeType = quotedMsg.stickerMessage?.mimetype || '';
        if (!mimeType.includes('webp')) {
            await sock.sendMessage(chatId, {
                text: '❌ Please reply to a WebP sticker!',
                ...(global.channelInfo || {})
            }, { quoted: message });
            return;
        }
        
        // Modify the sticker metadata
        let modifiedSticker;
        try {
            modifiedSticker = await addExif(stickerBuffer, packname || '', author || '');
            
            if (!modifiedSticker || modifiedSticker.length === 0) {
                throw new Error('Failed to modify sticker metadata');
            }
        } catch (exifError) {
            console.error('Exif modification error:', exifError);
            // If addExif fails, use original sticker
            modifiedSticker = stickerBuffer;
            
            await sock.sendMessage(chatId, {
                text: '⚠️ Could not modify metadata, sending original sticker...',
                ...(global.channelInfo || {})
            }, { quoted: message });
        }
        
        // Send the modified sticker
        await sock.sendMessage(chatId, {
            sticker: modifiedSticker,
            mimetype: 'image/webp'
        }, { quoted: message });
        
        // Show info about what was changed
        await sock.sendMessage(chatId, {
            text: `✅ *Sticker Repackaged!*\n\n📦 *Pack:* ${packname || 'Default'}\n👤 *Author:* ${author || 'Default'}`,
            ...(global.channelInfo || {})
        }, { quoted: message });
        
        // Success reaction
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        
    } catch (error) {
        console.error('Robbal command error:', error);
        
        let errorMessage = '❌ Failed to modify sticker!';
        
        if (error.message.includes('Failed to download')) {
            errorMessage = '❌ Failed to download sticker. Try again.';
        } else if (error.message.includes('WebP')) {
            errorMessage = '❌ Only WebP stickers are supported.';
        }
        
        await sock.sendMessage(chatId, {
            text: `${errorMessage}\n\n_Error: ${error.message}_`,
            ...(global.channelInfo || {})
        }, { quoted: message });
        
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

module.exports = robalCommand;