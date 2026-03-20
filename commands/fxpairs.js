const axios = require('axios');

async function fxpairsCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        await client.sendMessage(chatId, { react: { text: '💱', key: message.key } });

        const response = await axios.get('https://api.polygon.io/v3/reference/tickers?market=fx&active=true&apiKey=Y4iTYoJANwppB8I3Bm4QVWdV5oXlvc45');
        const data = response.data;

        if (!data.results) {
            await client.sendMessage(chatId, {
                text: "❌ Failed to fetch currency pairs."
            }, { quoted: message });
            return;
        }

        const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD', 'AUDUSD', 'NZDUSD'];
        let output = `💱 *MAJOR CURRENCY PAIRS*\n\n`;

        majorPairs.forEach(pair => {
            output += `• ${pair}\n`;
        });

        output += `\n💡 .exchange 100 USD EUR\n\n─ 404 XMD`;

        await client.sendMessage(chatId, { text: output }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: '❌ Failed to fetch currency pairs.'
        }, { quoted: message });
    }
}

module.exports = fxpairsCommand;