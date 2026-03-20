const axios = require('axios');

async function bibleCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (args.length === 0) {
            await client.sendMessage(chatId, {
                text: `📖 *BIBLE*\n\nExample: .bible John 1:1`
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '📖', key: message.key } });

        const reference = args.join(" ");
        const response = await axios.get(`https://bible-api.com/${encodeURIComponent(reference)}`);

        if (response.data.text) {
            await client.sendMessage(chatId, {
                text: `📖 *${response.data.reference}*\n\n${response.data.text}\n\n📚 ${response.data.translation_name}`
            }, { quoted: message });
        } else {
            await client.sendMessage(chatId, {
                text: "❌ Verse not found."
            }, { quoted: message });
        }

    } catch (error) {
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = bibleCommand;