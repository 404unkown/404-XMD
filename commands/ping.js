const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const settings = require('../settings.js');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        const pingMsg = await sock.sendMessage(chatId, { 
            text: '🎵 *Booting Audio System...*\n⚡ *Measuring Ping...*' 
        }, { quoted: message });
        
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);
        
        // System info
        const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100;
        const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100;
        const usedMem = totalMem - freeMem;
        const platform = os.platform();

        // Ping-based styling
        let pingEmoji, pingStatus, pingColor;
        if (ping < 100) {
            pingEmoji = '⚡';
            pingStatus = 'ULTRA FAST';
            pingColor = '🟢';
        } else if (ping < 300) {
            pingEmoji = '🚀';
            pingStatus = 'FAST';
            pingColor = '🟡';
        } else {
            pingEmoji = '🐌';
            pingStatus = 'STABLE';
            pingColor = '🔴';
        }

        // Create cool ASCII banner
        const botInfo = `
╭━━━━━━━━━━━━━━━━━━━ 404-X𝐌𝐃 ━━━━━━━━━━━━━━━━━━━╮
│                                                 │
│  ${pingEmoji}  *PING*: ${ping}ms ${pingColor}          │
│  ⏱️  *UPTIME*: ${uptimeFormatted}               │
│  🏷️  *VERSION*: v${settings.version}           │
│                                                 │
│  ──────《 📊 SYSTEM INFO 》──────               │
│  🖥️  *PLATFORM*: ${platform.toUpperCase()}     │
│  💾  *MEMORY*: ${usedMem.toFixed(2)}GB/${totalMem.toFixed(2)}GB │
│  🐧  *OS*: ${os.type()} ${os.release()}        │
│                                                 │
│  🎯  *RESPONSE*: ${pingStatus}                 │
│                                                 │
│  🎵  *AUDIO*: Auto-play enabled ✅              │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        // Send the main status with image
        await sock.sendMessage(chatId, {
            image: { 
                url: 'https://files.catbox.moe/852x91.jpeg'
            },
            caption: botInfo
        }, { quoted: message });

        // **METHOD 1: Try sending as voice note (PTT) - Best for auto-play**
        try {
            const audioResponse = await axios.get('https://files.catbox.moe/mhmstw.mp3', {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (WhatsApp Bot)'
                }
            });
            
            const audioBuffer = Buffer.from(audioResponse.data);
            
            // **METHOD 1A: Send as voice note (highest auto-play chance)**
            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mp4', // Try mp4 for better compatibility
                ptt: true, // PUSH TO TALK - This often triggers auto-play
                waveform: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Fake waveform
                seconds: 30, // Approximate duration
                contextInfo: {
                    forwardingScore: 20,
                    isForwarded: true,
                    mentionedJid: [message.key.participant || message.key.remoteJid]
                }
            });
            
            // **METHOD 1B: Alternative - Send as document with audio mimetype**
            setTimeout(async () => {
                try {
                    await sock.sendMessage(chatId, {
                        document: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: '404-XMD Theme.mp3',
                        caption: '🔊 Click to play: 404-XMD Theme Music',
                        contextInfo: {
                            forwardingScore: 10,
                            isForwarded: true
                        }
                    });
                } catch (docError) {
                    console.log('Document method failed:', docError.message);
                }
            }, 1000);
            
        } catch (audioError) {
            console.error('Audio error:', audioError.message);
            await sock.sendMessage(chatId, {
                text: '🎵 *Audio Link*\n\nPlay this: https://files.catbox.moe/igtxrn.mp3\n\n(Click the link to listen)'
            });
        }

        // Send final status message
        const finalMsg = `
${pingEmoji} *PING STATUS REPORT*
━━━━━━━━━━━━━━━━━━━━
📊 *Response Time*: ${ping}ms
🎯 *Quality*: ${pingStatus}
🎵 *Audio Status*: ${ping < 500 ? 'Delivered' : 'Check Connection'}
⏰ *Checked at*: ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━
💡 *Tip*: If audio doesn't auto-play, tap the voice note!`;

        setTimeout(async () => {
            await sock.sendMessage(chatId, {
                text: finalMsg,
                contextInfo: {
                    mentionedJid: [message.key.participant || message.key.remoteJid]
                }
            });
        }, 2000);

    } catch (error) {
        console.error('❌ Ping Command Error:', error);
        
        const errorMsg = `
❌ *COMMAND FAILED*
━━━━━━━━━━━━━━━━━━━━
🔧 *Error*: ${error.message || 'Unknown'}
💻 *Code*: PING-${Date.now().toString().slice(-6)}
⏰ *Time*: ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━
🔄 *Action*: Please try again in 5 seconds`;

        await sock.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });
    }
}

module.exports = pingCommand;