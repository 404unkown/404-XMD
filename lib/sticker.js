const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fluent_ffmpeg = require('fluent-ffmpeg');
const { fileTypeFromBuffer } = require('file-type');
const fetch = require('node-fetch');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

/**
 * Convert using fluent-ffmpeg
 * @param {string} img
 * @param {string} url
 */
function sticker6(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (url) {
                const res = await fetch(url);
                if (res.status !== 200) throw await res.text();
                img = await res.buffer();
            }
            
            const type = (await fileTypeFromBuffer(img)) || {
                mime: "application/octet-stream",
                ext: "bin",
            };
            
            if (type.ext == "bin") {
                reject(new Error('Invalid image format'));
                return;
            }
            
            const tmp = path.join(__dirname, `../tmp/${Date.now()}.${type.ext}`);
            const out = path.join(tmp + ".webp");
            
            await fs.promises.writeFile(tmp, img);
            
            // https://github.com/MhankBarBar/termux-wabot/blob/main/index.js#L313#L368
            const Fffmpeg = /video/i.test(type.mime)
                ? fluent_ffmpeg(tmp).inputFormat(type.ext)
                : fluent_ffmpeg(tmp).input(tmp);
                
            Fffmpeg.on("error", function (err) {
                console.error(err);
                try {
                    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
                } catch (e) {}
                reject(err);
            })
            .on("end", async function () {
                try {
                    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
                    let resultSticker = await fs.promises.readFile(out);
                    
                    // If sticker is larger than 1MB, compress it
                    if (resultSticker.length > 1000000) {
                        resultSticker = await sticker6_compress(img, null);
                    }
                    
                    resolve(resultSticker);
                } catch (error) {
                    reject(error);
                }
            })
            .addOutputOptions([
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
            ])
            .toFormat("webp")
            .save(out);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Convert using fluent-ffmpeg (compressed version)
 * @param {string} img
 * @param {string} url
 */
function sticker6_compress(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (url) {
                const res = await fetch(url);
                if (res.status !== 200) throw await res.text();
                img = await res.buffer();
            }
            
            const type = (await fileTypeFromBuffer(img)) || {
                mime: "application/octet-stream",
                ext: "bin",
            };
            
            if (type.ext == "bin") {
                reject(new Error('Invalid image format'));
                return;
            }
            
            const tmp = path.join(__dirname, `../tmp/${Date.now()}.${type.ext}`);
            const out = path.join(tmp + ".webp");
            
            await fs.promises.writeFile(tmp, img);
            
            const Fffmpeg = /video/i.test(type.mime)
                ? fluent_ffmpeg(tmp).inputFormat(type.ext)
                : fluent_ffmpeg(tmp).input(tmp);
                
            Fffmpeg.on("error", function (err) {
                console.error(err);
                try {
                    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
                } catch (e) {}
                reject(err);
            })
            .on("end", async function () {
                try {
                    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
                    const result = await fs.promises.readFile(out);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            })
            .addOutputOptions([
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `scale='min(224,iw)':min'(224,ih)':force_original_aspect_ratio=decrease,fps=15, pad=224:224:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
            ])
            .toFormat("webp")
            .save(out);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Sticker using wa-sticker-formatter
 * @param {Buffer} img
 * @param {string} url
 * @param {string} packname
 * @param {string} author
 * @param {Array} categories
 * @param {Object} extra
 */
async function sticker5(img, url, packname, author, categories = [""], extra = {}) {
    try {
        const buffer = await new Sticker(img ? img : url)
            .setPack(packname || global.packname || "My Pack")
            .setAuthor(author || global.author || "Me")
            .setQuality(10) // Lower quality for smaller size
            .setType(StickerTypes.FULL)
            .toBuffer();
        
        return buffer;
    } catch (error) {
        console.error('Sticker5 error:', error);
        throw error;
    }
}

/**
 * Add WhatsApp JSON Exif Metadata
 * Taken from https://github.com/pedroslopez/whatsapp-web.js/pull/527/files
 * @param {Buffer} webpSticker
 * @param {String} packname
 * @param {String} author
 * @param {String} categories
 * @param {Object} extra
 * @returns
 */
async function addExif(webpSticker, packname, author, categories = [""], extra = {}) {
    try {
        // Dynamic import for node-webpmux (since it might be ES module)
        const webp = await import('node-webpmux').then(m => m.default || m);
        const Image = webp.Image || webp;
        
        const img = new Image();
        const stickerPackId = crypto.randomBytes(32).toString("hex");
        const json = {
            "sticker-pack-id": stickerPackId,
            "sticker-pack-name": packname,
            "sticker-pack-publisher": author,
            emojis: categories,
            ...extra,
        };
        
        const exifAttr = Buffer.from([
            0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
            0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
        ]);
        
        const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        
        await img.load(webpSticker);
        img.exif = exif;
        return await img.save(null);
    } catch (error) {
        console.error('AddExif error:', error);
        return webpSticker; // Return original if exif addition fails
    }
}

/**
 * Main sticker function - tries different methods
 * @param {Buffer} img Image/Video Buffer
 * @param {String} url Image/Video URL
 * @param {String} packname
 * @param {String} author
 * @param {Array} categories
 * @param {Object} extra
 */
async function sticker(img, url, packname = "", author = "", categories = [""], extra = {}) {
    try {
        // Set defaults from global if not provided
        const finalPackname = packname || global.packname || "My Pack";
        const finalAuthor = author || global.author || "Me";
        
        // Try method 1: wa-sticker-formatter (simpler, no ffmpeg needed)
        console.log('Creating sticker using wa-sticker-formatter...');
        let stiker = await sticker5(img, url, finalPackname, finalAuthor, categories, extra);
        
        // Add exif metadata
        if (stiker) {
            try {
                stiker = await addExif(stiker, finalPackname, finalAuthor, categories, extra);
            } catch (exifError) {
                console.log('Exif addition failed, using plain sticker:', exifError.message);
            }
        }
        
        return stiker;
    } catch (error) {
        console.error('Sticker creation failed:', error);
        
        // Fallback to ffmpeg method if available
        try {
            console.log('Trying ffmpeg method...');
            const stiker = await sticker6(img, url);
            return stiker;
        } catch (ffmpegError) {
            console.error('All sticker methods failed:', ffmpegError);
            throw new Error(`Failed to create sticker: ${error.message}`);
        }
    }
}

// Support flags (for compatibility)
const support = {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false,
};

// Simple wrapper function for the qc command
async function createStickerFromBuffer(buffer, packname, author) {
    return await sticker(buffer, null, packname, author);
}

module.exports = {
    sticker,
    sticker5,
    sticker6,
    sticker6_compress,
    addExif,
    support,
    createStickerFromBuffer
};