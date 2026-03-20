// commands/removebg.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Function to upload image to a temporary service
async function uploadImage(buffer) {
  try {
    // You can use a free image hosting service
    // For now, we'll save to temp folder and return local URL
    const tempDir = process.env.TMPDIR || '/tmp';
    const filename = `upload_${Date.now()}.jpg`;
    const filepath = path.join(tempDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    // Return as base64 or use a service
    // Using base64 data URL for now
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
    
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
}

// Function to create sticker
async function createSticker(imageUrl, packname, author) {
  try {
    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // Create sticker (simplified version - you might need actual sticker creation logic)
    // For now, we'll return the buffer as is
    return buffer;
    
  } catch (error) {
    console.error('Create sticker error:', error);
    throw error;
  }
}

// Helper function to check if text is a URL
function isUrl(text) {
  const urlRegex = /^(https?):\/\/[^\s/$.?#]+\.(jpe?g|png|webp)$/i;
  return urlRegex.test(text);
}

async function removebgCommand(sock, chatId, message, args) {
  try {
    // Send processing reaction
    await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
    
    let stiker = false;
    let json;
    let hasImage = false;
    
    // Check if message has quoted image
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    // Check if quoted message has image
    if (quotedMsg?.imageMessage) {
      hasImage = true;
      
      // Download the image
      try {
        const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        // Upload image
        const media = await uploadImage(buffer);
        
        // Remove background using API
        const response = await axios.get(`https://aemt.me/removebg?url=${encodeURIComponent(media)}`);
        json = response.data;
        
        // Create sticker from result
        if (json.url?.result) {
          stiker = await createSticker(json.url.result, global.packname, global.author);
        }
        
      } catch (error) {
        console.error('Image processing error:', error);
        throw new Error('Failed to process image');
      }
      
    } 
    // Check if args contain a URL
    else if (args.length > 0 && isUrl(args[0])) {
      const url = args[0].trim();
      
      // Remove background from URL
      const response = await axios.get(`https://aemt.me/removebg?url=${encodeURIComponent(url)}`);
      json = response.data;
      
      // Create sticker from result
      if (json.url?.result) {
        stiker = await createSticker(json.url.result, global.packname, global.author);
      }
      
    } 
    // Check if message has direct image (not quoted)
    else if (message.message?.imageMessage) {
      hasImage = true;
      
      // Download the image
      try {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        // Upload image
        const media = await uploadImage(buffer);
        
        // Remove background using API
        const response = await axios.get(`https://aemt.me/removebg?url=${encodeURIComponent(media)}`);
        json = response.data;
        
        // Create sticker from result
        if (json.url?.result) {
          stiker = await createSticker(json.url.result, global.packname, global.author);
        }
        
      } catch (error) {
        console.error('Image processing error:', error);
        throw new Error('Failed to process image');
      }
      
    } 
    else {
      // No image or URL provided
      await sock.sendMessage(chatId, {
        text: `❌ *No image provided!*\n\n*Reply to an image or provide a URL:*\n${global.PREFIX || '.'}removebg [image_url]\n\n*Example:*\n${global.PREFIX || '.'}removebg https://example.com/image.jpg`,
        ...global.channelInfo
      }, { quoted: message });
      
      await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
      return;
    }
    
    // Check if API returned valid result
    if (!json?.url?.result) {
      throw new Error('Failed to remove background from image');
    }
    
    // Send the result image
    await sock.sendMessage(chatId, {
      image: { url: json.url.result },
      caption: `✅ *Background Removed Successfully!*`,
      ...global.channelInfo
    }, { quoted: message });
    
    // Send as sticker if available
    if (stiker) {
      await sock.sendMessage(chatId, {
        sticker: stiker,
        mimetype: 'image/webp'
      }, { quoted: message });
    }
    
    // Success reaction
    await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
    
  } catch (error) {
    console.error('RemoveBG command error:', error);
    
    let errorMessage = '❌ Failed to remove background!';
    
    if (error.message.includes('Failed to process image')) {
      errorMessage = '❌ Failed to process the image. Please try another image.';
    } else if (error.message.includes('Failed to remove background')) {
      errorMessage = '❌ Background removal service is unavailable.';
    } else if (error.message.includes('timeout')) {
      errorMessage = '❌ Request timed out. Please try again.';
    }
    
    await sock.sendMessage(chatId, {
      text: `${errorMessage}\n\nError: ${error.message}`,
      ...global.channelInfo
    }, { quoted: message });
    
    await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
  }
}

module.exports = removebgCommand;