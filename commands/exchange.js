const axios = require('axios');

async function exchangeCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        await client.sendMessage(chatId, { react: { text: '💱', key: message.key } });

        const text = args.join(' ').trim();

        if (text) {
            const parts = text.split(' ');
            if (parts.length === 3) {
                const [amount, fromCurrency, toCurrency] = parts;
                const amountNum = parseFloat(amount);

                if (isNaN(amountNum)) {
                    await client.sendMessage(chatId, {
                        text: `❌ Invalid amount\n\nUsage: .exchange 100 USD EUR`
                    }, { quoted: message });
                    return;
                }

                const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency.toUpperCase()}`);
                const data = response.data;

                if (!data || !data.rates) {
                    await client.sendMessage(chatId, {
                        text: `❌ Invalid currency: ${fromCurrency}`
                    }, { quoted: message });
                    return;
                }

                const rate = data.rates[toCurrency.toUpperCase()];
                if (!rate) {
                    await client.sendMessage(chatId, {
                        text: `❌ Invalid currency: ${toCurrency}`
                    }, { quoted: message });
                    return;
                }

                const converted = amountNum * rate;

                await client.sendMessage(chatId, {
                    text: `💱 *${amountNum} ${fromCurrency.toUpperCase()}* = *${converted.toFixed(2)} ${toCurrency.toUpperCase()}*\n\n📊 Rate: 1 ${fromCurrency.toUpperCase()} = ${rate.toFixed(4)} ${toCurrency.toUpperCase()}`
                }, { quoted: message });
                return;
            }
        }

        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const data = response.data;

        let output = `💱 *EXCHANGE RATES (USD)*\n\n`;
        output += `• EUR: ${data.rates.EUR.toFixed(4)}\n`;
        output += `• GBP: ${data.rates.GBP.toFixed(4)}\n`;
        output += `• JPY: ${data.rates.JPY.toFixed(4)}\n`;
        output += `• CAD: ${data.rates.CAD.toFixed(4)}\n`;
        output += `• AUD: ${data.rates.AUD.toFixed(4)}\n`;
        output += `• CHF: ${data.rates.CHF.toFixed(4)}\n`;
        output += `• CNY: ${data.rates.CNY.toFixed(4)}\n`;
        output += `• INR: ${data.rates.INR.toFixed(4)}\n\n`;
        output += `💡 .exchange 100 USD EUR\n\n─ 404 XMD`;

        await client.sendMessage(chatId, { text: output }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: '❌ Failed to fetch exchange rates.'
        }, { quoted: message });
    }
}

module.exports = exchangeCommand;