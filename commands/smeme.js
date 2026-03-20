const { sticker } = require('../lib/sticker.js');
const uploadImage = require('../lib/uploadImage.js');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function smemeCommand(sock, chatId, message, args) {
    try {
        // Parse text for meme (format: "top text|bottom text")
        const text = args.join(' ');
        let atas = ''; // Top text
        let bawah = ''; // Bottom text
        
        if (text.includes('|')) {
            const parts = text.split('|');
            atas = parts[0].trim();
            bawah = parts.slice(1).join('|').trim();
        } else if (text) {
            atas = text.trim();
        }
        
        // Check if message is replying to an image
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg?.imageMessage) {
            await sock.sendMessage(chatId, {
                text: `🎭 *Sticker Meme Creator*\n\n❌ *Please reply to an image!*\n\n*Usage:*\nReply to image with: ${global.PREFIX || '.'}smeme top text|bottom text\n\n*Examples:*\n• ${global.PREFIX || '.'}smeme Hello|World\n• ${global.PREFIX || '.'}smeme Funny Text\n• ${global.PREFIX || '.'}smeme Top Text Only|`,
                ...(global.channelInfo || {})
            }, { quoted: message });
            return;
        }
        
        // Send processing reaction
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        
        // Download the image
        let imageBuffer;
        try {
            const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            imageBuffer = Buffer.concat(chunks);
            
            if (!imageBuffer || imageBuffer.length === 0) {
                throw new Error('Failed to download image');
            }
        } catch (downloadError) {
            console.error('Image download error:', downloadError);
            throw new Error('Failed to download image. Try again.');
        }
        
        // Upload image to get URL
        let imageUrl;
        try {
            imageUrl = await uploadImage(imageBuffer);
        } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error('Failed to upload image for meme creation.');
        }
        
        // Create meme URL using memegen.link API
        const encodedTop = encodeURIComponent(atas || '');
        const encodedBottom = encodeURIComponent(bawah || '');
        const encodedImageUrl = encodeURIComponent(imageUrl);
        
        const memeUrl = `https://api.memegen.link/images/custom/${encodedTop}/${encodedBottom}.png?background=${encodedImageUrl}`;
        
        // Create sticker from the meme
        const stickerBuffer = await sticker(null, memeUrl, global.packname || "Meme Pack", global.author || "Bot");
        
        // Send the sticker
        await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
            mimetype: 'image/webp',
            caption: atas || bawah ? `*Meme:* ${atas ? atas + ' ' : ''}${bawah ? '| ' + bawah : ''}` : ''
        }, { quoted: message });
        
        // Success reaction
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        
    } catch (error) {
        console.error('Smeme command error:', error);
        
        let errorMessage = '❌ Failed to create meme sticker!';
        
        if (error.message.includes('Failed to download')) {
            errorMessage = '❌ Failed to download image. Try again.';
        } else if (error.message.includes('Failed to upload')) {
            errorMessage = '❌ Failed to process image. Try a different image.';
        } else if (error.message.includes('Meme API')) {
            errorMessage = '❌ Meme service is currently unavailable.';
        } else if (error.message.includes('timeout')) {
            errorMessage = '❌ Request timed out. Please try again.';
        }
        
        await sock.sendMessage(chatId, {
            text: `${errorMessage}\n\n_Error: ${error.message}_`,
            ...(global.channelInfo || {})
        }, { quoted: message });
        
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

module.exports = smemeCommand;