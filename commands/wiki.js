const axios = require('axios');

async function wikiCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const query = args.join(' ').trim();

        if (!query) {
            await client.sendMessage(chatId, {
                text: `📚 *WIKIPEDIA*\n\nExample: .wiki JavaScript`
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '📚', key: message.key } });

        const response = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
        );

        const data = response.data;
        
        await client.sendMessage(chatId, {
            text: `📚 *${data.title}*\n\n${data.extract.substring(0, 1500)}...\n\n🔗 ${data.content_urls?.desktop?.page || ''}`
        }, { quoted: message });

    } catch (error) {
        if (error.response?.status === 404) {
            await client.sendMessage(chatId, {
                text: `❌ No results found for "${args.join(' ')}"`
            }, { quoted: message });
        } else {
            await client.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
}

module.exports = wikiCommand;