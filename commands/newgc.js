const isOwner = require('../lib/isOwner');
const config = require('../settings');

async function newgcCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const isUserOwner = await isOwner(sender, client, chatId);
        
        if (!isUserOwner && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '❌ Only bot owner can use this command!'
            }, { quoted: message });
            return;
        }

        const fullCommand = args.join(' ');
        
        if (!fullCommand.includes(';')) {
            await client.sendMessage(chatId, {
                text: `📝 *CREATE GROUP*\n\nUsage: .newgc Group Name;254769769295,254712345678`
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        const [groupName, numbersString] = fullCommand.split(';');
        
        if (!groupName || !numbersString) {
            await client.sendMessage(chatId, {
                text: '❌ Please provide group name and numbers!'
            }, { quoted: message });
            return;
        }

        const participantNumbers = numbersString
            .split(',')
            .map(num => num.trim().replace(/[^0-9]/g, ''))
            .filter(num => num.length >= 9)
            .map(num => num + '@s.whatsapp.net');

        if (participantNumbers.length === 0) {
            await client.sendMessage(chatId, {
                text: '❌ No valid numbers provided!'
            }, { quoted: message });
            return;
        }

        const ownerNumber = config.owner + '@s.whatsapp.net';
        if (!participantNumbers.includes(ownerNumber)) {
            participantNumbers.push(ownerNumber);
        }

        const group = await client.groupCreate(groupName.trim(), participantNumbers);
        const inviteCode = await client.groupInviteCode(group.id);
        
        await client.sendMessage(chatId, {
            text: `✅ Group created!\n🔗 ${inviteCode}`
        }, { quoted: message });

    } catch (error) {
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = newgcCommand;