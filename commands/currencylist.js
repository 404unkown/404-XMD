const axios = require('axios');

async function currencylistCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        await client.sendMessage(chatId, { react: { text: '💱', key: message.key } });

        const response = await axios.get('https://v6.exchangerate-api.com/v6/0d36793326ec3af0c240a8d4/latest/USD');
        const data = response.data;

        if (!data || data.result !== "success") {
            await client.sendMessage(chatId, {
                text: '❌ Failed to retrieve currency rates.'
            }, { quoted: message });
            return;
        }

        const commonCurrencies = [
            'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 
            'INR', 'BRL', 'ZAR', 'RUB', 'KRW', 'SGD', 'NZD', 'MXN',
            'HKD', 'NOK', 'SEK', 'TRY', 'AED', 'SAR', 'THB', 'MYR'
        ];

        let text = `💱 *CURRENCY RATES (USD Base)*\n\n`;
        
        for (const currency of commonCurrencies) {
            if (data.conversion_rates[currency]) {
                text += `*${currency}*: ${data.conversion_rates[currency].toFixed(4)}\n`;
            }
        }

        text += `\n💡 Use .exchange 100 USD EUR to convert`;
        text += `\n\n─ 404 XMD`;

        await client.sendMessage(chatId, { text }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: '❌ Failed to fetch currency rates.'
        }, { quoted: message });
    }
}

module.exports = currencylistCommand;