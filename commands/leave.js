const isOwner = require('../lib/isOwner');

async function leaveCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups.'
            }, { quoted: message });
            return;
        }

        const isUserOwner = await isOwner(sender, client, chatId);
        const botOwner = client.user.id.split(":")[0] + '@s.whatsapp.net';
        const isBotOwnerSender = sender === botOwner;

        if (!isUserOwner && !isBotOwnerSender && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '❌ Only the bot owner can use this command.'
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '👋', key: message.key } });
        await client.sendMessage(chatId, { text: '👋 Leaving group...' }, { quoted: message });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await client.groupLeave(chatId);

    } catch (error) {
        console.error("Leave Command Error:", error);
    }
}

module.exports = leaveCommand;