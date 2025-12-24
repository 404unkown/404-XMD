// /commands/uptime.js
const { runtime } = require('../lib/functions');
const settings = require('../settings');

module.exports = async function uptimeCommand(sock, chatId, message) {
    try {
        const uptime = runtime(process.uptime());
        const startTime = new Date(Date.now() - process.uptime() * 1000);
        
        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const usedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const totalMemory = Math.round(memoryUsage.heapTotal / 1024 / 1024);
        
        // Get Node.js version
        const nodeVersion = process.version;
        
        // Get platform info
        const platform = process.platform;
        const arch = process.arch;
        
        // Calculate uptime percentages
        const totalSeconds = process.uptime();
        const totalMinutes = totalSeconds / 60;
        const totalHours = totalMinutes / 60;
        const totalDays = totalHours / 24;

        const timeReport = `
╭─❖ *BOT UPTIME* ❖─
│
├─⏱️ *Uptime:* ${uptime}
├─🕰️ *Started:* ${startTime.toLocaleString()}
├─📊 *Memory Usage:* ${usedMemory}MB / ${totalMemory}MB
├─⚡ *Node.js:* ${nodeVersion}
├─🖥️ *Platform:* ${platform} ${arch}
│
├─📈 *Detailed Uptime:*
│  ├─ Days: ${Math.floor(totalDays)}
│  ├─ Hours: ${Math.floor(totalHours % 24)}
│  ├─ Minutes: ${Math.floor(totalMinutes % 60)}
│  └─ Seconds: ${Math.floor(totalSeconds % 60)}
│
╰─➤ ${settings.packname || 'Bot Powered by 404TECH '}
        `.trim();

        // Send the message
        await sock.sendMessage(chatId, {
            text: timeReport,
            contextInfo: {
                mentionedJid: [message.key.participant || message.key.remoteJid],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: settings.author || 'Bot Owner',
                    serverMessageId: 143
                }
            }
        }, { quoted: message });

        // Add reaction
        await sock.sendMessage(chatId, {
            react: { text: '⏱️', key: message.key }
        });

    } catch (error) {
        console.error('Uptime command error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ Failed to get uptime: ${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true
            }
        }, { quoted: message });
    }
};