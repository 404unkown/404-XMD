const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, {
            text: `🤖 *${settings.botName || '404 XMD'} is alive!*\n\n✅ Bot is running\n📝 Type *${settings.PREFIX || '.'}menu* for commands`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: settings.botName || '404 XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        await sock.sendMessage(chatId, { text: '✅ Bot is alive!' }, { quoted: message });
    }
}

module.exports = aliveCommand;