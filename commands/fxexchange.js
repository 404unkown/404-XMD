const axios = require('axios');

async function fxexchangeCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        await client.sendMessage(chatId, { react: { text: '💱', key: message.key } });

        const currencyCode = args[0]?.toUpperCase() || "USD";
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currencyCode}`);
        const data = response.data;

        if (!data || !data.rates) {
            await client.sendMessage(chatId, {
                text: `❌ Failed to fetch rates for ${currencyCode}`
            }, { quoted: message });
            return;
        }

        const major = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'KES'];
        let output = `💱 *RATES (${data.base})*\n\n`;

        major.forEach(currency => {
            if (data.rates[currency] && currency !== data.base) {
                output += `• ${currency}: ${data.rates[currency].toFixed(4)}\n`;
            }
        });

        output += `\n💡 .exchange 100 USD EUR\n\n─ 404 XMD`;

        await client.sendMessage(chatId, { text: output }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: '❌ Failed to fetch exchange rates.'
        }, { quoted: message });
    }
}

module.exports = fxexchangeCommand;