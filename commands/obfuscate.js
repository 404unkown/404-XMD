const Obf = require("javascript-obfuscator");

async function obfuscateCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (!message.quoted) {
            await client.sendMessage(chatId, {
                text: `🔒 *OBFUSCATE*\n\nReply to JavaScript code with .obfuscate`
            }, { quoted: message });
            return;
        }

        const code = message.quoted.text;
        
        if (!code) {
            await client.sendMessage(chatId, {
                text: `❌ No code found.`
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '🔒', key: message.key } });

        const obfuscated = Obf.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true,
            numbersToExpressions: true
        }).getObfuscatedCode();

        const response = obfuscated.length > 4000 ? obfuscated.substring(0, 4000) + '...' : obfuscated;

        await client.sendMessage(chatId, {
            text: `🔒 *OBFUSCATED CODE*\n\n\`\`\`javascript\n${response}\n\`\`\``
        }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = obfuscateCommand;