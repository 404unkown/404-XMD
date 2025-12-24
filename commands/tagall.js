const isAdmin = require('../lib/isAdmin');

async function tagAllCommand(sock, chatId, senderId, message, userMessage) {
    try {
        const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
        
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: '```Only group admins can use the .tagall command.```' 
            }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: 'No participants found in the group.' });
            return;
        }

        // Check if there's a custom message after .tagall
        let customMessage = '';
        if (userMessage) {
            const args = userMessage.split(' ');
            if (args.length > 1) {
                // Remove the command part and keep the rest as custom message
                customMessage = args.slice(1).join(' ');
            }
        }

        // Create message with each member on a new line
        let messageText = customMessage ? `🔊 ${customMessage}\n\n` : '🔊 *Hello Everyone:*\n\n';
        
        participants.forEach(participant => {
            messageText += `@${participant.id.split('@')[0]}\n`;
        });

        // Send message with mentions
        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: participants.map(p => p.id)
        });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to tag all members.' });
    }
}

module.exports = tagAllCommand;  // Export directly