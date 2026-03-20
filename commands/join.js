const isOwner = require('../lib/isOwner');

async function joinCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const isUserOwner = await isOwner(sender, client, chatId);
        
        if (!isUserOwner && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '❌ Only bot owner can use this command!'
            }, { quoted: message });
            return;
        }

        const groupLink = args[0];
        
        if (!groupLink) {
            await client.sendMessage(chatId, {
                text: `📬 *JOIN GROUP*\n\nExample: .join https://chat.whatsapp.com/xxxxxx`
            }, { quoted: message });
            return;
        }

        const match = groupLink.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
        if (!match) {
            await client.sendMessage(chatId, {
                text: '❌ Invalid WhatsApp group link!'
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '📬', key: message.key } });
        await client.groupAcceptInvite(match[1]);
        
        await client.sendMessage(chatId, {
            text: '✅ Successfully joined the group!'
        }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: `❌ Failed to join: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = joinCommand;