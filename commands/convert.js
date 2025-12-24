const fs = require('fs');
const path = require('path');

module.exports = async (sock, chatId, message, rawText) => {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: "✨ *Sticker Converter*\n\nPlease reply to a sticker message\n\n*Example:* .convert (reply to sticker)\n*Aliases:* .sticker2img, .stoimg, .stickertoimage, .s2i"
            }, { quoted: message });
            return;
        }

        if (!quotedMsg.stickerMessage) {
            await sock.sendMessage(chatId, {
                text: "❌ Only sticker messages can be converted to images"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Download the sticker
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const media = quotedMsg.stickerMessage;
        
        const stream = await downloadContentFromMessage(media, 'sticker');
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const stickerBuffer = Buffer.concat(chunks);

        // Convert sticker to image
        const imageBuffer = await convertStickerToImage(stickerBuffer);

        // Send the converted image
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: "🤖 *Powered by 404XMD*",
            mimetype: 'image/png'
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Sticker conversion error:', error);
        
        await sock.sendMessage(chatId, {
            text: "❌ Failed to convert sticker. Please try with a different sticker."
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};

// Simple sticker to image converter
async function convertStickerToImage(stickerBuffer) {
    try {
        // Method 1: Try to use webp-converter if installed
        try {
            const webp = require('webp-converter');
            const tempPath = path.join(process.cwd(), 'temp', `sticker_${Date.now()}`);
            
            // Write buffer to temp file
            fs.writeFileSync(`${tempPath}.webp`, stickerBuffer);
            
            // Convert webp to png
            await webp.dwebp(`${tempPath}.webp`, `${tempPath}.png`, '-o');
            
            // Read converted file
            const pngBuffer = fs.readFileSync(`${tempPath}.png`);
            
            // Cleanup
            fs.unlinkSync(`${tempPath}.webp`);
            fs.unlinkSync(`${tempPath}.png`);
            
            return pngBuffer;
            
        } catch (webpError) {
            console.log('webp-converter not available, trying alternative...');
        }
        
        // Method 2: Check if it's already an image format
        const header = stickerBuffer.slice(0, 8).toString('hex');
        
        // Check if it's PNG
        if (header === '89504e470d0a1a0a') {
            return stickerBuffer;
        }
        
        // Check if it's JPEG
        if (header.slice(0, 4) === 'ffd8') {
            return stickerBuffer;
        }
        
        // Method 3: If it's webp but no converter, return as-is with warning
        if (header.slice(0, 4) === '524946') { // 'RIFF' header for webp
            console.log('WebP sticker detected but no converter available');
            return stickerBuffer;
        }
        
        // Default: return original buffer
        return stickerBuffer;
        
    } catch (error) {
        console.error('Conversion helper error:', error);
        return stickerBuffer; // Fallback
    }
}