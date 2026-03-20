const isAdmin = require('../lib/isAdmin');

async function addCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups.'
            }, { quoted: message });
            return;
        }

        const senderAdminStatus = await isAdmin(client, chatId, sender);
        if (!senderAdminStatus.isSenderAdmin) {
            await client.sendMessage(chatId, {
                text: '❌ Only group admins can use this command.'
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        let number;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo;
        
        if (quotedMsg?.participant) {
            number = quotedMsg.participant.split('@')[0];
        } else if (quotedMsg?.mentionedJid?.length > 0) {
            number = quotedMsg.mentionedJid[0].split('@')[0];
        } else if (args[0]) {
            number = args[0].replace(/[^0-9]/g, '');
        }

        if (!number || number.length < 9) {
            await client.sendMessage(chatId, {
                text: `❌ *ADD MEMBER*\n\nUsage: .add 254769769295\nOr reply to a message with .add`
            }, { quoted: message });
            return;
        }

        const jid = number + "@s.whatsapp.net";
        await client.groupParticipantsUpdate(chatId, [jid], "add");
        
        await client.sendMessage(chatId, {
            text: `✅ Added @${number}`,
            mentions: [jid]
        }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: `❌ Failed to add: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = addCommand;