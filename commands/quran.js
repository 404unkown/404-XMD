const axios = require('axios');

async function quranCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (!args[0]) {
            await client.sendMessage(chatId, {
                text: `🕋 *QURAN*\n\nExample: .quran 1\nExample: .quran Al-Fatiha`
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '🕋', key: message.key } });

        const surahListRes = await axios.get('https://quran-endpoint.vercel.app/quran');
        const surahList = surahListRes.data.data;

        let surahData = surahList.find(surah =>
            surah.number === Number(args[0]) ||
            surah.asma.ar.short.toLowerCase() === args[0].toLowerCase() ||
            surah.asma.en.short.toLowerCase() === args[0].toLowerCase()
        );

        if (!surahData) {
            await client.sendMessage(chatId, {
                text: `❌ Surah "${args[0]}" not found.`
            }, { quoted: message });
            return;
        }

        const res = await axios.get(`https://quran-endpoint.vercel.app/quran/${surahData.number}`);
        const json = res.data;

        await client.sendMessage(chatId, {
            text: `🕋 *Surah ${json.data.number}: ${json.data.asma.ar.long}*\n\n📖 ${json.data.type.en}\n✅ Verses: ${json.data.ayahCount}\n\n⚡ Tafsir:\n${json.data.tafsir.id.substring(0, 500)}...`
        }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = quranCommand;