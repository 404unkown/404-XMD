// /commands/uptime.js
module.exports = async function uptimeCommand(sock, chatId, message) {
    try {
        const seconds = process.uptime();
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        let uptimeString = '';
        if (days > 0) uptimeString += `${days}d `;
        if (hours > 0) uptimeString += `${hours}h `;
        if (minutes > 0) uptimeString += `${minutes}m `;
        uptimeString += `${Math.floor(seconds % 60)}s`;

        await sock.sendMessage(chatId, {
            text: `⏱️ *Uptime:* ${uptimeString}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: message });
    }
};