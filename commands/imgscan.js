const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const path = require("path");

module.exports = async (sock, chatId, message, rawText) => {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: "🔍 *AI Image Scanner*\n\nPlease reply to an image for AI analysis\n\n*Example:* .imgscan (reply to photo)\n.scanimg (reply to image)\n.analyzeimg (reply to image)\n\n*Supported formats:* JPEG, PNG"
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

        // Analyze the image
        const analysis = await analyzeImage(imageBuffer);

        // Send the analysis results
        await sock.sendMessage(chatId, {
            text: `🔍 *AI IMAGE ANALYSIS*\n\n` +
                  `${analysis}\n\n` +
                  `🤖 *Powered by 404XMD*\n` +
                  `*Note:* AI analysis may not be 100% accurate`
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Image scan error:', error);
        
        let errorMsg = "❌ Failed to analyze image.";
        if (error.message.includes("upload")) {
            errorMsg = "❌ Image upload failed. Please try with a smaller image.";
        } else if (error.message.includes("API")) {
            errorMsg = "❌ AI service unavailable. Please try again later.";
        } else if (error.message.includes("size")) {
            errorMsg = "❌ Image too large. Maximum size is 5MB.";
        }

        await sock.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};

// Function to analyze image using AI
async function analyzeImage(imageBuffer) {
    try {
        // Check image size
        if (imageBuffer.length > 5 * 1024 * 1024) { // 5MB limit
            throw new Error("Image size exceeds 5MB limit");
        }

        // Method 1: Upload to image hosting and analyze
        const imageUrl = await uploadImageToHosting(imageBuffer);
        
        // Use AI analysis API
        const apiUrl = `https://apis.davidcyriltech.my.id/imgscan?url=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });

        if (!response.data?.success) {
            throw new Error(response.data?.message || "Analysis failed");
        }

        return formatAnalysisResults(response.data.result);

    } catch (error) {
        console.error('Primary analysis failed:', error.message);
        
        // Fallback: Try alternative API
        return await analyzeImageFallback(imageBuffer);
    }
}

// Upload image to temporary hosting
async function uploadImageToHosting(buffer) {
    try {
        const form = new FormData();
        form.append('file', buffer, { filename: 'image.jpg' });
        
        // Try Telegraph first
        const response = await axios.post('https://telegra.ph/upload', form, {
            headers: form.getHeaders(),
            timeout: 15000
        });

        if (response.data && response.data[0] && response.data[0].src) {
            return 'https://telegra.ph' + response.data[0].src;
        }
    } catch (error) {
        console.log('Telegraph upload failed, trying Catbox...');
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

    throw new Error("Failed to upload image for analysis");
}

// Format analysis results for better readability
function formatAnalysisResults(analysisText) {
    // Clean up the text
    let formatted = analysisText
        .replace(/\. /g, '.\n• ')
        .replace(/\*\*/g, '*')
        .replace(/__/g, '_');
    
    // Add sections if not present
    if (!formatted.includes(':')) {
        formatted = '*Analysis:*\n' + formatted;
    }
    
    // Limit length
    if (formatted.length > 1500) {
        formatted = formatted.substring(0, 1500) + '...\n\n*Analysis truncated due to length*';
    }
    
    return formatted;
}

// Fallback analysis method
async function analyzeImageFallback(buffer) {
    try {
        // Use a different API as fallback
        const base64Image = buffer.toString('base64');
        
        // Try Google Vision API (requires API key) or alternative
        // For now, return basic analysis
        
        return "*Basic Image Analysis:*\n" +
               "• Format: " + (buffer[0] === 0xFF && buffer[1] === 0xD8 ? "JPEG" : 
                              buffer[0] === 0x89 && buffer[1] === 0x50 ? "PNG" : "Unknown") + "\n" +
               "• Size: " + Math.round(buffer.length / 1024) + "KB\n" +
               "• This appears to be an image file. For detailed AI analysis, please try again later.";
               
    } catch (error) {
        return "*Analysis Results:*\n" +
               "⚠️ *Unable to perform detailed AI analysis*\n\n" +
               "Possible reasons:\n" +
               "• Image format not supported\n" +
               "• AI service temporarily unavailable\n" +
               "• Image size too large\n\n" +
               "Please try again with a different image.";
    }
}