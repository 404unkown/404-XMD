const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function webcrawlCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const url = args[0];

        if (!url) {
            await client.sendMessage(chatId, {
                text: `🕷️ *WEBCRAWL*\n\nExample: .webcrawl https://example.com`
            }, { quoted: message });
            return;
        }

        if (!url.startsWith('http')) {
            await client.sendMessage(chatId, {
                text: '❌ Please provide a valid URL starting with http:// or https://'
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '🕷️', key: message.key } });

        const response = await fetch(url, { timeout: 15000 });
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('title').text() || 'No title';
        const description = $('meta[name="description"]').attr('content') || 'No description';
        
        const links = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('http') && links.length < 10) {
                links.push(href);
            }
        });

        await client.sendMessage(chatId, {
            text: `🕷️ *${title}*\n\n📝 ${description}\n\n🔗 First ${links.length} links:\n${links.join('\n')}\n\n📊 Page size: ${(html.length / 1024).toFixed(1)} KB`
        }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = webcrawlCommand;