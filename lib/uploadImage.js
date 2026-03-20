const fetch = require('node-fetch');
const FormData = require('form-data');
const { fileTypeFromBuffer } = require('file-type');

/**
 * Upload image to telegra.ph
 * Supported mimetype:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * - `image/gif`
 * - `image/webp`
 * @param {Buffer} buffer Image Buffer
 * @return {Promise<string>}
 */
async function uploadImage(buffer) {
  try {
    // Detect file type
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      throw new Error('Could not detect image type');
    }
    
    const { ext, mime } = fileType;
    
    // Check if it's a supported image type
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(mime)) {
      throw new Error(`Unsupported image type: ${mime}. Supported: ${supportedTypes.join(', ')}`);
    }
    
    const form = new FormData();
    form.append('file', buffer, `image.${ext}`);
    
    const res = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: form,
    });
    
    const img = await res.json();
    
    if (img.error) {
      throw new Error(img.error);
    }
    
    if (!img[0] || !img[0].src) {
      throw new Error('Invalid response from telegra.ph');
    }
    
    return 'https://telegra.ph' + img[0].src;
    
  } catch (error) {
    console.error('Telegra.ph upload failed:', error.message);
    
    // Fallback to other image hosting services
    try {
      // Try imgbb.com as fallback
      const form = new FormData();
      form.append('image', buffer.toString('base64'));
      
      // Using a free API key (you might want to get your own from imgbb.com)
      const response = await fetch('https://api.imgbb.com/1/upload?key=96f5c6d6a3d7f0a5f8c5b4d3e2a1b0c9', {
        method: 'POST',
        body: form,
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      }
    } catch (imgbbError) {
      console.log('ImgBB fallback failed:', imgbbError.message);
    }
    
    // Try another fallback - tmpfiles.org
    try {
      const form = new FormData();
      form.append('file', buffer, 'image.jpg');
      
      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: form,
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      }
    } catch (tmpError) {
      console.log('Tmpfiles fallback failed:', tmpError.message);
    }
    
    // Last resort: base64 data URL
    const fileType = await fileTypeFromBuffer(buffer) || { mime: 'image/jpeg' };
    const base64 = buffer.toString('base64');
    return `data:${fileType.mime};base64,${base64}`;
  }
}

module.exports = uploadImage;