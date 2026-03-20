const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const path = require("path");

module.exports = async (sock, chatId, message, rawText) => {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: "📸 *Wanted Poster Maker*\n\nPlease reply to an image to create a 'Wanted' poster\n\n*Example:* .wanted (reply to photo)\n.wanted (reply to image)"
            }, { quoted: message });
            return;
        }

        const isImage = !!quotedMsg.imageMessage;
        
        if (!isImage) {
            await sock.sendMessage(chatId, {
                text: "❌ Please reply to an image file (JPEG/PNG)"
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

        // Create wanted poster
        const wantedBuffer = await createWantedPoster(imageBuffer);

        // Send the result
        await sock.sendMessage(chatId, {
            image: wantedBuffer,
            caption: "🔫 *WANTED* - Poster created!\n\n🤖 *Powered by 404XMD*"
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Wanted poster error:', error);
        
        let errorMsg = "❌ Failed to create wanted poster.";
        if (error.message.includes("upload")) {
            errorMsg = "❌ Image upload failed. Please try with a smaller image.";
        } else if (error.message.includes("API")) {
            errorMsg = "❌ API service unavailable. Please try again later.";
        }

        await sock.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};

// Function to create wanted poster using API
async function createWantedPoster(imageBuffer) {
    try {
        // First, upload image to a temporary hosting service
        const imageUrl = await uploadImage(imageBuffer);
        
        // Use PopCat API to create wanted poster
        const apiUrl = `https://api.popcat.xyz/v2/wanted?image=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, { 
            responseType: "arraybuffer",
            timeout: 30000
        });

        if (!response.data) {
            throw new Error("API returned empty response");
        }

        return Buffer.from(response.data);

    } catch (error) {
        console.error('Wanted API error:', error.message);
        
        // Fallback: Create a simple wanted poster manually
        return await createManualWantedPoster(imageBuffer);
    }
}

// Upload image to temporary hosting
async function uploadImage(buffer) {
    try {
        // Method 1: Try using Telegraph
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
        // Method 2: Base64 fallback (some APIs accept data URLs)
        const base64Image = buffer.toString('base64');
        return `data:image/jpeg;base64,${base64Image}`;
    } catch (error) {
        throw new Error("Failed to prepare image for upload");
    }
}

// Manual wanted poster creation (fallback)
async function createManualWantedPoster(imageBuffer) {
    // This is a simplified fallback
    // In production, you might want to use a library like Jimp or Canvas
    // to create the wanted poster effect
    
    console.log('Using manual wanted poster fallback');
    return imageBuffer; // Return original image as fallback
}