async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: 'pong!' }, { quoted: message });
        const end = Date.now();
        const ping = end - start;

        await sock.sendMessage(chatId, { 
            text: `💨 *Pong!*\n⚡ Speed: ${ping}ms`
        }, { quoted: message });

    } catch (error) {
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: message });
    }
}

module.exports = pingCommand;