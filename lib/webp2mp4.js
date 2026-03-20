const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * Convert WebP to MP4 using ezgif.com
 * @param {Buffer|String} source - WebP buffer or URL
 * @returns {Promise<string>} - MP4 URL
 */
async function webp2mp4(source) {
    try {
        const form = new FormData();
        const isUrl = typeof source === 'string' && /https?:\/\//.test(source);
        
        if (isUrl) {
            form.append('new-image-url', source);
        } else {
            // If it's a buffer
            form.append('new-image', source, 'image.webp');
        }
        
        // Step 1: Upload to ezgif
        const res = await fetch('https://ezgif.com/webp-to-mp4', {
            method: 'POST',
            body: form
        });
        
        const html = await res.text();
        
        // Parse HTML to get form data
        const jsdom = require('jsdom');
        const { JSDOM } = jsdom;
        const { document } = new JSDOM(html).window;
        
        const form2 = new FormData();
        const obj = {};
        
        // Get all form inputs
        const inputs = document.querySelectorAll('form input[name]');
        for (let input of inputs) {
            obj[input.name] = input.value;
            form2.append(input.name, input.value);
        }
        
        // Step 2: Process conversion
        const res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, {
            method: 'POST',
            body: form2
        });
        
        const html2 = await res2.text();
        const { document: document2 } = new JSDOM(html2).window;
        
        // Get the converted video URL
        const videoSource = document2.querySelector('div#output > p.outfile > video > source');
        if (!videoSource || !videoSource.src) {
            throw new Error('Conversion failed - no video found');
        }
        
        const videoUrl = new URL(videoSource.src, res2.url).toString();
        return videoUrl;
        
    } catch (error) {
        console.error('WebP to MP4 conversion error:', error);
        
        // Simple fallback: return original if conversion fails
        if (typeof source === 'string') {
            return source; // Return URL as-is
        }
        throw error;
    }
}

/**
 * Convert WebP to PNG using ezgif.com
 * @param {Buffer|String} source - WebP buffer or URL
 * @returns {Promise<string>} - PNG URL
 */
async function webp2png(source) {
    try {
        const form = new FormData();
        const isUrl = typeof source === 'string' && /https?:\/\//.test(source);
        
        if (isUrl) {
            form.append('new-image-url', source);
        } else {
            form.append('new-image', source, 'image.webp');
        }
        
        // Step 1: Upload to ezgif
        const res = await fetch('https://ezgif.com/webp-to-png', {
            method: 'POST',
            body: form
        });
        
        const html = await res.text();
        
        // Parse HTML
        const jsdom = require('jsdom');
        const { JSDOM } = jsdom;
        const { document } = new JSDOM(html).window;
        
        const form2 = new FormData();
        const obj = {};
        
        const inputs = document.querySelectorAll('form input[name]');
        for (let input of inputs) {
            obj[input.name] = input.value;
            form2.append(input.name, input.value);
        }
        
        // Step 2: Process conversion
        const res2 = await fetch('https://ezgif.com/webp-to-png/' + obj.file, {
            method: 'POST',
            body: form2
        });
        
        const html2 = await res2.text();
        const { document: document2 } = new JSDOM(html2).window;
        
        // Get the converted image URL
        const imgElement = document2.querySelector('div#output > p.outfile > img');
        if (!imgElement || !imgElement.src) {
            throw new Error('Conversion failed - no image found');
        }
        
        const imageUrl = new URL(imgElement.src, res2.url).toString();
        return imageUrl;
        
    } catch (error) {
        console.error('WebP to PNG conversion error:', error);
        
        // Alternative method using node-webpmux if ezgif fails
        try {
            if (typeof source !== 'string') {
                const { Image } = require('node-webpmux');
                const img = new Image();
                await img.load(source);
                const pngBuffer = await img.save(null);
                
                // Upload the converted PNG
                const uploadForm = new FormData();
                uploadForm.append('file', pngBuffer, 'converted.png');
                
                const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
                    method: 'POST',
                    body: uploadForm
                });
                
                const data = await uploadRes.json();
                return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            }
        } catch (fallbackError) {
            console.error('Fallback conversion also failed:', fallbackError);
        }
        
        throw error;
    }
}

/**
 * Simple WebP to PNG conversion (local, no external API)
 * @param {Buffer} webpBuffer - WebP image buffer
 * @returns {Promise<Buffer>} - PNG buffer
 */
async function webp2pngLocal(webpBuffer) {
    try {
        const { Image } = require('node-webpmux');
        const img = new Image();
        await img.load(webpBuffer);
        return await img.save(null); // Returns PNG buffer
    } catch (error) {
        console.error('Local WebP to PNG conversion failed:', error);
        throw error;
    }
}

module.exports = {
    webp2mp4,
    webp2png,
    webp2pngLocal
};