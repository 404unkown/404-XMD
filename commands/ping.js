const axios = require('axios');
const os = require('os');
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

function getRandomIcon(icons) {
    return icons[Math.floor(Math.random() * icons.length)];
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: '🚀 *Turbo Pinging...*' }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);
        
        // System info
        const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100;
        const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100;
        const usedMem = totalMem - freeMem;
        const platform = os.platform();
        
        // Dynamic icons based on ping
        const pingIcon = ping < 100 ? '⚡' : ping < 500 ? '🚀' : '🐢';
        const statusIcon = ping < 200 ? '🟢' : ping < 500 ? '🟡' : '🔴';
        
        // Random cool icons
        const icons = {
            cpu: getRandomIcon(['⚙️', '🔧', '🎛️', '💻']),
            ram: getRandomIcon(['🧠', '💾', '🎚️', '📊']),
            os: getRandomIcon(['🖥️', '📱', '💿', '🖱️']),
            version: getRandomIcon(['🎯', '📦', '🏷️', '🔖'])
        };

        const botInfo = `
╔═══════════《 404-X𝐌𝐃 》═══════════╗
║                                             ║
║  ${pingIcon} *PING*: ${ping}ms ${statusIcon}
║  ⏱️ *UPTIME*: ${uptimeFormatted}
║  ${icons.version} *VERSION*: v${settings.version}
║                                             ║
║  ───《 SYSTEM INFO 》────
║  ${icons.cpu} *PLATFORM*: ${platform.toUpperCase()}
║  ${icons.ram} *MEMORY*: ${usedMem}GB / ${totalMem}GB
║  ${icons.os} *OS*: ${os.type()} ${os.release()}
║                                             ║
║  🔥 *Response Time*: ${ping < 100 ? 'ULTRA FAST' : ping < 300 ? 'FAST' : 'STABLE'}
║                                             ║
║  🎵 *Audio Status*: Loading...
╚═══════════════════════════════════════╝`.trim();

        // Send the catbox image with animated caption
        await sock.sendMessage(chatId, {
            image: { 
                url: 'https://files.catbox.moe/852x91.jpeg'
            },
            caption: botInfo,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: false
            }
        }, { quoted: message });

        // **FIXED: Use a reliable MP3 URL that works with WhatsApp**
        // Using a different audio source - try multiple options
        const audioUrls = [
            'https://files.catbox.moe/igtxrn.mp3', // Alternative from catbox
            'https://files.catbox.moe/igtxrn.mp3', // Another option
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Reliable test MP3
        ];

        let audioSent = false;
        
        // Try each audio URL until one works
        for (let i = 0; i < audioUrls.length; i++) {
            try {
                console.log(`Trying audio URL ${i + 1}: ${audioUrls[i]}`);
                
                // Download the audio file
                const audioResponse = await axios.get(audioUrls[i], { 
                    responseType: 'arraybuffer',
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const audioBuffer = Buffer.from(audioResponse.data, 'binary');
                
                // Check if buffer has content
                if (audioBuffer.length < 1000) {
                    console.log(`Audio URL ${i + 1} returned small file, trying next...`);
                    continue;
                }
                
                console.log(`Audio downloaded successfully: ${audioBuffer.length} bytes`);
                
                // Send as audio message with proper properties
                await sock.sendMessage(chatId, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false, // Changed to false as true might cause issues
                    fileName: '404-XMD-Theme.mp3',
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 1,
                        stanzaId: message.key.id,
                        participant: message.key.participant || message.key.remoteJid
                    }
                });
                
                console.log(`Audio sent successfully from URL ${i + 1}`);
                audioSent = true;
                break; // Exit loop if successful
                
            } catch (audioError) {
                console.log(`Failed with URL ${i + 1}:`, audioError.message);
                // Try next URL
            }
        }
        
        if (!audioSent) {
            // If all URLs fail, send a text message with link
            console.log('All audio URLs failed, sending text fallback');
            await sock.sendMessage(chatId, {
                text: '🎵 *Audio Issue*\n\nCould not send audio file.\nTry this link instead:\nhttps://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            });
        }

        // Send final status message
        const qualityMsg = ping < 100 ? 
            `⚡ *Lightning Fast Connection!* ⚡\n\n📊 *Ping*: ${ping}ms\n🎵 *Audio*: ${audioSent ? 'Sent ✅' : 'Link provided'}\n⏰ *Checked*: ${new Date().toLocaleTimeString()}` :
            ping < 300 ? 
            `🚀 *Excellent Response Time!* 🚀\n\n📊 *Ping*: ${ping}ms\n🎵 *Audio*: ${audioSent ? 'Sent ✅' : 'Link provided'}\n⏰ *Checked*: ${new Date().toLocaleTimeString()}` :
            `📡 *Connection Stable* 📡\n\n📊 *Ping*: ${ping}ms\n🎵 *Audio*: ${audioSent ? 'Sent ✅' : 'Link provided'}\n⏰ *Checked*: ${new Date().toLocaleTimeString()}`;
            
        await sock.sendMessage(chatId, {
            text: qualityMsg,
            contextInfo: {
                mentionedJid: [message.key.participant || message.key.remoteJid]
            }
        });

    } catch (error) {
        console.error('🔥 Error in ping command:', error);
        
        const errorMsg = `❌ *Error Detected!*
        
🔧 *Issue*: ${error.message || 'Unknown'}
⏰ *Time*: ${new Date().toLocaleTimeString()}
📊 *Action*: Please try again!`;
        
        await sock.sendMessage(chatId, { 
            text: errorMsg,
            contextInfo: {
                mentionedJid: [message.key.participant || message.key.remoteJid]
            }
        }, { quoted: message });
    }
}

module.exports = pingCommand;