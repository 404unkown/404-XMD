const axios = require('axios');

async function fxstatusCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        await client.sendMessage(chatId, { react: { text: '📊', key: message.key } });

        const response = await axios.get('https://api.polygon.io/v1/marketstatus/now?apiKey=Y4iTYoJANwppB8I3Bm4QVWdV5oXlvc45');
        const data = response.data;

        if (!data) {
            await client.sendMessage(chatId, {
                text: "📊 Failed to fetch market status."
            }, { quoted: message });
            return;
        }

        const market = data.market === 'open' ? '🟢 OPEN' : '🔴 CLOSED';
        const afterHours = data.afterHours === 'open' ? '🟢 OPEN' : '🔴 CLOSED';

        let output = `📊 *MARKET STATUS*\n\n`;
        output += `• Market: ${market}\n`;
        output += `• After Hours: ${afterHours}\n`;
        output += `• Time: ${data.serverTime}\n\n`;
        output += `• Crypto: ${data.currencies?.crypto === 'open' ? '🟢' : '🔴'}\n`;
        output += `• Forex: ${data.currencies?.fx === 'open' ? '🟢' : '🔴'}\n`;
        output += `• Stocks: ${data.exchanges?.nyse === 'open' ? '🟢' : '🔴'}\n\n`;
        output += `─ 404 XMD`;

        await client.sendMessage(chatId, { text: output }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: '📊 Failed to fetch market status.'
        }, { quoted: message });
    }
}

module.exports = fxstatusCommand;