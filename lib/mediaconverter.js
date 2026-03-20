// /lib/mediaconverter.js
const fsPromises = require('fs').promises;
const fs = require('fs'); // Added for synchronous operations
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Create temp directory
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Utility functions
function getRandomString(length = 10) {
    return Math.random().toString(36).substring(2, length + 2);
}

function getExtensionFromMime(mimeType) {
    const extensions = {
        'audio/mpeg': 'mp3',
        'audio/aac': 'aac',
        'audio/ogg': 'ogg',
        'audio/opus': 'opus',
        'video/mp4': 'mp4',
        'video/quicktime': 'mov',
        'video/x-matroska': 'mkv',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
    };
    return extensions[mimeType] || 'bin';
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
        .filter(Boolean)
        .join(':');
}

// Download cover image
async function downloadCoverImage() {
    const COVER_URL = 'https://files.catbox.moe/4itzeu.jpg';
    const coverPath = path.join(tempDir, `cover_${getRandomString()}.jpg`);
    
    try {
        const response = await axios.get(COVER_URL, { responseType: 'arraybuffer' });
        await fsPromises.writeFile(coverPath, response.data);
        return coverPath;
    } catch (error) {
        console.error('Failed to download cover image:', error);
        // Create a blank image as fallback
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(640, 480);
        const ctx = canvas.getContext('2d');
        
        // Fill with gradient
        const gradient = ctx.createLinearGradient(0, 0, 640, 480);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#8e44ad');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 480);
        
        // Add text
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Audio Visualizer', 320, 240);
        
        // Save
        const buffer = canvas.toBuffer('image/jpeg');
        await fsPromises.writeFile(coverPath, buffer);
        return coverPath;
    }
}

// Convert audio to video with cover
async function audioToVideo(audioBuffer, audioExt = 'mp3') {
    const audioPath = path.join(tempDir, `audio_${getRandomString()}.${audioExt}`);
    const outputPath = path.join(tempDir, `video_${getRandomString()}.mp4`);
    
    try {
        // Write audio to file
        await fsPromises.writeFile(audioPath, audioBuffer);
        
        // Download cover image
        const coverPath = await downloadCoverImage();
        
        // Convert using ffmpeg
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(coverPath)
                .inputOptions(['-loop 1'])
                .input(audioPath)
                .outputOptions([
                    '-c:v libx264',
                    '-preset fast',
                    '-crf 22',
                    '-c:a aac',
                    '-b:a 128k',
                    '-pix_fmt yuv420p',
                    '-shortest',
                    '-vf scale=640:480:force_original_aspect_ratio=decrease'
                ])
                .save(outputPath)
                .on('end', async () => {
                    // Read output file
                    const videoBuffer = await fsPromises.readFile(outputPath);
                    
                    // Clean up temp files
                    await Promise.all([
                        fsPromises.unlink(audioPath).catch(() => {}),
                        fsPromises.unlink(coverPath).catch(() => {}),
                        fsPromises.unlink(outputPath).catch(() => {})
                    ]);
                    
                    resolve(videoBuffer);
                })
                .on('error', async (err) => {
                    // Clean up on error
                    await Promise.all([
                        fsPromises.unlink(audioPath).catch(() => {}),
                        fsPromises.unlink(coverPath).catch(() => {}),
                        fsPromises.unlink(outputPath).catch(() => {})
                    ]);
                    reject(err);
                });
        });
    } catch (error) {
        // Clean up on any error
        await Promise.all([
            fsPromises.unlink(audioPath).catch(() => {}),
            fsPromises.unlink(outputPath).catch(() => {})
        ]);
        throw error;
    }
}

// Convert to audio (MP3)
async function toAudio(buffer, ext = 'mp4') {
    const inputPath = path.join(tempDir, `input_${getRandomString()}.${ext}`);
    const outputPath = path.join(tempDir, `output_${getRandomString()}.mp3`);
    
    try {
        await fsPromises.writeFile(inputPath, buffer);
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioCodec('libmp3lame')
                .audioBitrate(128)
                .format('mp3')
                .save(outputPath)
                .on('end', async () => {
                    const audioBuffer = await fsPromises.readFile(outputPath);
                    
                    // Clean up
                    await Promise.all([
                        fsPromises.unlink(inputPath).catch(() => {}),
                        fsPromises.unlink(outputPath).catch(() => {})
                    ]);
                    
                    resolve(audioBuffer);
                })
                .on('error', async (err) => {
                    await Promise.all([
                        fsPromises.unlink(inputPath).catch(() => {}),
                        fsPromises.unlink(outputPath).catch(() => {})
                    ]);
                    reject(err);
                });
        });
    } catch (error) {
        await Promise.all([
            fsPromises.unlink(inputPath).catch(() => {}),
            fsPromises.unlink(outputPath).catch(() => {})
        ]);
        throw error;
    }
}

// Convert to WhatsApp voice note (PTT)
async function toPTT(buffer, ext = 'mp4') {
    const inputPath = path.join(tempDir, `input_${getRandomString()}.${ext}`);
    const outputPath = path.join(tempDir, `output_${getRandomString()}.ogg`);
    
    try {
        await fsPromises.writeFile(inputPath, buffer);
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioCodec('libopus')
                .audioFrequency(48000)
                .audioChannels(1)
                .audioBitrate('64k')
                .outputOptions([
                    '-application voip',
                    '-frame_duration 20',
                    '-vbr on',
                    '-compression_level 10'
                ])
                .format('ogg')
                .save(outputPath)
                .on('end', async () => {
                    const pttBuffer = await fsPromises.readFile(outputPath);
                    
                    // Clean up
                    await Promise.all([
                        fsPromises.unlink(inputPath).catch(() => {}),
                        fsPromises.unlink(outputPath).catch(() => {})
                    ]);
                    
                    resolve(pttBuffer);
                })
                .on('error', async (err) => {
                    await Promise.all([
                        fsPromises.unlink(inputPath).catch(() => {}),
                        fsPromises.unlink(outputPath).catch(() => {})
                    ]);
                    reject(err);
                });
        });
    } catch (error) {
        await Promise.all([
            fsPromises.unlink(inputPath).catch(() => {}),
            fsPromises.unlink(outputPath).catch(() => {})
        ]);
        throw error;
    }
}

// Clean temp files older than 1 hour
async function cleanOldFiles() {
    try {
        const files = await fsPromises.readdir(tempDir);
        const now = Date.now();
        
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = await fsPromises.stat(filePath);
            
            if (now - stats.mtimeMs > 60 * 60 * 1000) { // 1 hour
                await fsPromises.unlink(filePath).catch(() => {});
            }
        }
    } catch (error) {
        console.error('Error cleaning temp files:', error);
    }
}

// Run cleaner every 30 minutes
setInterval(cleanOldFiles, 30 * 60 * 1000);

module.exports = {
    audioToVideo,
    toAudio,
    toPTT,
    tempDir,
    getExtensionFromMime,
    formatDuration,
    cleanOldFiles
};