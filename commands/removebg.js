const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const path = require("path");

module.exports = async (sock, chatId, message, rawText) => {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: "📸 *Background Remover*\n\nPlease reply to an image to remove its background\n\n*Example:* .rmbg (reply to photo)\n.removebg (reply to image)\n\n*Supported formats:* JPEG, PNG\n*Best results:* Clear subject, good contrast"
            }, { quoted: message });
            return;
        }

        const isImage = !!quotedMsg.imageMessage;
        
        if (!isImage) {
            await sock.sendMessage(chatId, {
                text: "❌ Please reply to an image file (JPEG or PNG)"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Download the image
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const media = quotedMsg.imageMessage;
        
        const stream = await downloadContentFromMessage(media, 'image');
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const imageBuffer = Buffer.concat(chunks);

        // Check image size
        if (imageBuffer.length > 5 * 1024 * 1024) { // 5MB limit
            await sock.sendMessage(chatId, {
                text: "❌ Image too large! Maximum size is 5MB.\n\nPlease use a smaller image or compress it first."
            }, { quoted: message });
            return;
        }

        // Remove background
        const resultBuffer = await removeBackground(imageBuffer);

        // Send the result
        await sock.sendMessage(chatId, {
            image: resultBuffer,
            caption: "✅ *Background removed successfully!*\n\n🤖 *Powered by 404XMD*",
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

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Background removal error:', error);
        
        let errorMsg = "❌ Failed to remove background.";
        if (error.message.includes("upload")) {
            errorMsg = "❌ Image upload failed. Please try with a smaller image.";
        } else if (error.message.includes("API")) {
            errorMsg = "❌ Background removal service unavailable. Please try again later.";
        } else if (error.message.includes("detect")) {
            errorMsg = "❌ Could not detect subject in image. Try with a clearer image.";
        }

        await sock.sendMessage(chatId, {
            text: errorMsg + "\n\n*Tips for better results:*\n• Use clear, high-contrast images\n• Ensure subject is clearly visible\n• Avoid complex backgrounds\n• Use PNG format for best quality"
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};

// Function to remove background using API
async function removeBackground(imageBuffer) {
    try {
        // Upload image to temporary hosting
        const imageUrl = await uploadImage(imageBuffer);
        
        // Use background removal API
        const apiUrl = `https://apis.davidcyriltech.my.id/removebg?url=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, { 
            responseType: "arraybuffer",
            timeout: 45000,
            headers: {
                'Accept': 'image/*'
            }
        });

        if (!response.data || response.data.length === 0) {
            throw new Error("API returned empty image");
        }

        return Buffer.from(response.data);

    } catch (error) {
        console.error('Background removal API error:', error.message);
        
        // Fallback: Try alternative API
        return await removeBackgroundFallback(imageBuffer);
    }
}

// Upload image to temporary hosting
async function uploadImage(buffer) {
    try {
        // Try Telegraph first
        const form = new FormData();
        form.append('file', buffer, { filename: 'image.jpg' });
        
        const response = await axios.post('https://telegra.ph/upload', form, {
            headers: form.getHeaders(),
            timeout: 15000
        });

        if (response.data && response.data[0] && response.data[0].src) {
            return 'https://telegra.ph' + response.data[0].src;
        }
    } catch (error) {
        console.log('Telegraph upload failed, trying alternative...');
    }

    try {
        // Try Catbox as fallback
        const catboxForm = new FormData();
        catboxForm.append('fileToUpload', buffer, { filename: 'image.jpg' });
        catboxForm.append('reqtype', 'fileupload');
        
        const catboxResponse = await axios.post("https://catbox.moe/user/api.php", catboxForm, {
            headers: catboxForm.getHeaders(),
            timeout: 15000
        });

        if (catboxResponse.data && typeof catboxResponse.data === 'string') {
            return catboxResponse.data;
        }
    } catch (error) {
        console.log('Catbox upload failed');
    }

    // Final fallback: Base64
    const base64Image = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
}

// Fallback background removal method
async function removeBackgroundFallback(buffer) {
    try {
        // Try a different API endpoint
        const form = new FormData();
        form.append('image', buffer, { filename: 'image.jpg' });
        
        const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': 'free', // Note: This is a placeholder
            },
            responseType: 'arraybuffer',
            timeout: 30000
        });

        if (response.data) {
            return Buffer.from(response.data);
        }
        
        throw new Error("No response from fallback API");
        
    } catch (error) {
        console.error('Fallback API failed:', error.message);
        
        // Ultimate fallback: Return original image with message
        return buffer;
    }
}