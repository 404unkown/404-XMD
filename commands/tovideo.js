const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const COVER_URL = 'https://files.catbox.moe/mpu90y.png';
const TEMP_DIR = path.join(process.cwd(), 'temp');
const MAX_RETRIES = 3;

// Utility functions
function getRandomFileName(ext) {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
}

async function downloadWithRetry(url, filePath, retries = MAX_RETRIES) {
    while (retries > 0) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            await fs.promises.writeFile(filePath, response.data);
            return true;
        } catch (err) {
            retries--;
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

async function runFFmpeg(args, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        const { spawn } = require('child_process');
        const ffmpeg = spawn(ffmpegPath, args);
        let stderrData = '';

        const timer = setTimeout(() => {
            ffmpeg.kill();
            reject(new Error('FFmpeg timeout'));
        }, timeout);

        ffmpeg.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        ffmpeg.on('close', (code) => {
            clearTimeout(timer);
            if (code === 0) {
                resolve(stderrData);
            } else {
                reject(new Error(`FFmpeg error ${code}\n${stderrData}`));
            }
        });

        ffmpeg.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

async function toVideoCommand(sock, chatId, message) {
    try {
        // Check if quoted message exists
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: "*🎵 Please reply to an audio message*\n\nExample: Reply to an audio and type `.tovideo`"
            }, { quoted: message });
            return;
        }

        // Check if quoted is audio
        if (!quotedMsg.audioMessage) {
            await sock.sendMessage(chatId, {
                text: "*❌ Only audio messages can be converted to video*\n\nPlease reply to an audio message"
            }, { quoted: message });
            return;
        }

        // File paths
        const coverPath = path.join(TEMP_DIR, getRandomFileName('jpg'));
        const audioPath = path.join(TEMP_DIR, getRandomFileName('mp3'));
        const outputPath = path.join(TEMP_DIR, getRandomFileName('mp4'));

        try {
            // Send initial processing message
            const processingMsg = await sock.sendMessage(chatId, {
                text: "*🔄 Starting conversion process...*\n\nPlease wait while I convert your audio to video"
            }, { quoted: message });

            // Step 1: Download cover image
            await sock.sendMessage(chatId, {
                text: "*⬇️ Downloading cover image...*",
                edit: processingMsg.key
            });
            await downloadWithRetry(COVER_URL, coverPath);

            // Step 2: Save audio file
            await sock.sendMessage(chatId, {
                text: "*💾 Saving audio file...*",
                edit: processingMsg.key
            });
            
            // Download audio buffer using Baileys method
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const media = quotedMsg.audioMessage;
            const stream = await downloadContentFromMessage(media, 'audio');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const audioBuffer = Buffer.concat(chunks);
            
            await fs.promises.writeFile(audioPath, audioBuffer);

            // Step 3: Convert to video
            await sock.sendMessage(chatId, {
                text: "*🎥 Converting to video...*",
                edit: processingMsg.key
            });

            // FIXED FFmpeg arguments - ensure even dimensions
            const ffmpegArgs = [
                '-y', // Overwrite output files without asking
                '-loop', '1', // Loop the image
                '-i', coverPath, // Input cover image
                '-i', audioPath, // Input audio
                '-c:v', 'libx264', // Video codec
                '-preset', 'ultrafast', // Fast encoding
                '-crf', '23', // Quality level
                '-c:a', 'aac', // Audio codec
                '-b:a', '128k', // Audio bitrate
                '-pix_fmt', 'yuv420p', // Pixel format (requires even dimensions)
                '-shortest', // Finish when shortest input ends
                '-vf', 'scale=640:640:force_original_aspect_ratio=increase,crop=640:640', // FIXED: Ensure 640x640 even dimensions
                '-movflags', '+faststart', // Optimize for streaming
                outputPath // Output file
            ];

            console.log('Running FFmpeg with args:', ffmpegArgs);
            await runFFmpeg(ffmpegArgs);

            // Verify output
            if (!fs.existsSync(outputPath)) {
                throw new Error('Video file was not created');
            }

            // Send result
            const videoBuffer = await fs.promises.readFile(outputPath);
            await sock.sendMessage(chatId, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                caption: "🎵 Audio to Video Conversion Complete!\n\nYour audio is now a video with cover!"
            }, { quoted: message });

        } catch (error) {
            console.error('Conversion error:', error);
            await sock.sendMessage(chatId, {
                text: `*❌ Conversion failed*\nError: ${error.message}\n\nTry again or use a different audio.`
            }, { quoted: message });
        } finally {
            // Cleanup files
            const filesToDelete = [coverPath, audioPath, outputPath];
            for (const file of filesToDelete) {
                try {
                    if (fs.existsSync(file)) {
                        await fs.promises.unlink(file);
                    }
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError.message);
                }
            }
        }

    } catch (error) {
        console.error('ToVideo command error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ Failed to process: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = toVideoCommand;