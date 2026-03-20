const axios = require('axios');

async function forexCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        await client.sendMessage(chatId, { react: { text: '📰', key: message.key } });

        const response = await axios.get('https://api.polygon.io/v2/reference/news?apiKey=Y4iTYoJANwppB8I3Bm4QVWdV5oXlvc45');
        const data = response.data;

        if (!data.results || data.results.length === 0) {
            await client.sendMessage(chatId, {
                text: "📰 No forex news available."
            }, { quoted: message });
            return;
        }

        const articles = data.results.slice(0, 3);
        let output = "📰 *FOREX NEWS*\n\n";

        articles.forEach((article, index) => {
            output += `*${index + 1}. ${article.title}*\n`;
            output += `📌 ${article.publisher.name}\n`;
            output += `🔗 ${article.article_url}\n\n`;
        });

        output += "─ 404 XMD";

        await client.sendMessage(chatId, { text: output }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: "📰 Failed to fetch forex news."
        }, { quoted: message });
    }
}

module.exports = forexCommand;