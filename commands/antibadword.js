const { setAntibadword, getAntibadword, removeAntibadword } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

async function handleAntibadwordCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        // CHECK: Sender must be admin
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```For Group Admins Only!```' }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(prefix.length + 'antibadword'.length).trim().split(' ');
        const action = args[0]?.toLowerCase();

        if (!action) {
            const usage = `\`\`\`ANTIBADWORD SETUP\n\n${prefix}antibadword on\n${prefix}antibadword off\n${prefix}antibadword get\n\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntibadword(chatId);
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Antibadword is already on_*' }, { quoted: message });
                    return;
                }
                const result = await setAntibadword(chatId, true);
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antibadword has been turned ON_*' : '*_Failed to turn on Antibadword_*' 
                }, { quoted: message });
                break;

            case 'off':
                await removeAntibadword(chatId);
                await sock.sendMessage(chatId, { text: '*_Antibadword has been turned OFF_*' }, { quoted: message });
                break;

            case 'get':
                const status = await getAntibadword(chatId);
                await sock.sendMessage(chatId, { 
                    text: `*_Antibadword Configuration:_*\nStatus: ${status?.enabled ? 'ON' : 'OFF'}` 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { text: `*_Use ${prefix}antibadword for usage._*` });
        }
    } catch (error) {
        console.error('Error in antibadword command:', error);
        await sock.sendMessage(chatId, { text: '*_Error processing antibadword command_*' });
    }
}

async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const antibadwordSetting = await getAntibadword(chatId);
        if (!antibadwordSetting?.enabled) return;

        console.log(`Antibadword Setting for ${chatId}: ${antibadwordSetting.enabled}`);
        
        const badWords = [
            // English bad words
            'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'whore', 'slut',
            'bastard', 'motherfucker', 'bullshit', 'damn', 'hell', 'crap', 'piss',
            
            // Hindi/Urdu bad words
            'madarchod', 'behenchod', 'bhosdike', 'chutiya', 'gaandu', 'lauda', 'lund',
            'kutta', 'kuttiya', 'randi', 'rand', 'saala', 'saali', 'harami', 'kamine',
            
            // Tamil bad words
            'otha', 'punda', 'soothu', 'mairu', 'naai', 'panni', 'kevalam',
            
            // Telugu bad words
            'lanja', 'pooka', 'dengey', 'erri', 'puku',
            
            // Kannada bad words
            'naaye', 'henge', 'thika', 'munde',
            
            // Malayalam bad words
            'patti', 'myre', 'punda', 'poori', 'kotham',
        ];

        const messageText = userMessage.toLowerCase();
        let containsBadWord = false;
        let detectedBadWord = '';

        // Check if message contains any bad words
        for (const word of badWords) {
            if (messageText.includes(word)) {
                containsBadWord = true;
                detectedBadWord = word;
                break;
            }
        }

        // Also check for variations with symbols/spaces
        if (!containsBadWord) {
            const variations = badWords.map(word => 
                word.split('').join('[\\s\\*\\-\\.]*')
            );
            const variationPattern = new RegExp(variations.join('|'), 'i');
            if (variationPattern.test(messageText)) {
                containsBadWord = true;
                detectedBadWord = 'inappropriate word';
            }
        }

        if (containsBadWord) {
            const quotedMessageId = message.key.id;
            const quotedParticipant = message.key.participant || senderId;

            console.log(`Attempting to delete message with bad word: ${detectedBadWord}`);

            try {
                // Delete the message with bad word
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
                    text: `Warning! @${senderId.split('@')[0]}, using bad words is not allowed in this group.`,
                    mentions: mentionedJidList 
                });
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        }
    } catch (error) {
        console.error('Error in badword detection:', error);
    }
}

module.exports = {
    handleAntibadwordCommand,
    handleBadwordDetection,
};