const { bots } = require('../lib/antilink');
const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

// Check if BOT OWNER is admin in the group
async function isBotOwnerAdmin(sock, chatId) {
    try {
        const metadata = await sock.groupMetadata(chatId);
        // Replace with your actual bot owner's number (without @s.whatsapp.net)
        const botOwnerNumber = '1234567890'; // Change this to your number
        
        // Convert to standard JID format
        const botOwnerJid = `${botOwnerNumber}@s.whatsapp.net`;
        
        const owner = metadata.participants.find(p => p.id === botOwnerJid);
        return owner?.admin === 'admin' || owner?.admin === 'superadmin';
    } catch (error) {
        console.error('Error checking bot owner admin status:', error);
        return false;
    }
}

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        // CHECK: Sender must be admin OR bot owner must be admin
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```For Group Admins Only!```' }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(prefix.length + 'antilink'.length).trim().split(' ');
        const action = args[0]?.toLowerCase();

        if (!action) {
            const usage = `\`\`\`ANTILINK SETUP\n\n${prefix}antilink on\n${prefix}antilink set delete | kick | warn\n${prefix}antilink off\n${prefix}antilink get\n\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId);
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Antilink is already on_*' }, { quoted: message });
                    return;
                }
                const result = await setAntilink(chatId, true, 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antilink has been turned ON_*' : '*_Failed to turn on Antilink_*' 
                }, { quoted: message });
                break;

            case 'off':
                await removeAntilink(chatId);
                await sock.sendMessage(chatId, { text: '*_Antilink has been turned OFF_*' }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `*_Please specify an action: ${prefix}antilink set delete | kick | warn_*` 
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1].toLowerCase();
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '*_Invalid action. Choose delete, kick, or warn._*' 
                    }, { quoted: message });
                    return;
                }
                
                const currentConfig = await getAntilink(chatId);
                if (!currentConfig?.enabled) {
                    await sock.sendMessage(chatId, { 
                        text: '*_Please turn on antilink first using: .antilink on_*' 
                    }, { quoted: message });
                    return;
                }
                
                const setResult = await setAntilink(chatId, true, setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `*_Antilink action set to ${setAction}_*` : '*_Failed to set Antilink action_*' 
                }, { quoted: message });
                break;

            case 'get':
                const status = await getAntilink(chatId);
                await sock.sendMessage(chatId, { 
                    text: `*_Antilink Configuration:_*\nStatus: ${status?.enabled ? 'ON' : 'OFF'}\nAction: ${status?.action || 'Not set'}` 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { text: `*_Use ${prefix}antilink for usage._*` });
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
        await sock.sendMessage(chatId, { text: '*_Error processing antilink command_*' });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const antilinkSetting = await getAntilink(chatId);
        if (!antilinkSetting?.enabled) return;

        console.log(`Antilink Setting for ${chatId}: ${antilinkSetting.action}`);
        
        let shouldDelete = false;

        const linkPatterns = {
            whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
            whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
            telegram: /t\.me\/[A-Za-z0-9_]+/i,
            allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
        };

        const action = antilinkSetting.action;

        if (action === 'delete' || action === 'kick' || action === 'warn') {
            if (linkPatterns.whatsappGroup.test(userMessage) || 
                linkPatterns.whatsappChannel.test(userMessage) || 
                linkPatterns.telegram.test(userMessage) || 
                linkPatterns.allLinks.test(userMessage)) {
                shouldDelete = true;
            }
        }

        if (shouldDelete) {
            // CHECK: Bot owner must be admin to delete links
            const botOwnerAdmin = await isBotOwnerAdmin(sock, chatId);
            if (!botOwnerAdmin) {
                // You can optionally send a message or just silently skip deletion
                console.log('Bot owner is not admin, skipping link deletion');
                return;
            }

            const quotedMessageId = message.key.id;
            const quotedParticipant = message.key.participant || senderId;

            console.log(`Attempting to delete message with id: ${quotedMessageId} from participant: ${quotedParticipant}`);

            try {
                await sock.sendMessage(chatId, {
                    delete: { 
                        remoteJid: chatId, 
                        fromMe: false, 
                        id: quotedMessageId, 
                        participant: quotedParticipant 
                    },
                });
                console.log(`Message with ID ${quotedMessageId} deleted successfully.`);
                
                // Send warning message after deletion
                const mentionedJidList = [senderId];
                await sock.sendMessage(chatId, { 
                    text: `Warning! @${senderId.split('@')[0]}, links are not allowed in my group next time you send a link I'll just kick you out of the group.`,
                    mentions: mentionedJidList 
                });
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        }
    } catch (error) {
        console.error('Error in link detection:', error);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};