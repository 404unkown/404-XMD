async function diceCommand(sock, chatId, message, args) {
    try {
        // Send processing reaction
        await sock.sendMessage(chatId, { react: { text: '🎲', key: message.key } });
        
        // Simple dice roll with emoji
        const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const diceResult = Math.floor(Math.random() * 6) + 1;
        const diceFace = diceEmoji[diceResult - 1];
        
        // Create a simple dice text sticker
        const diceText = `
╭─────╮
│     │
│  ${diceFace}  │
│     │
╰─────╯`;
        
        await sock.sendMessage(chatId, {
            text: `${diceText}\n\n🎲 *Dice Roll:* ${diceResult}`,
            ...(global.channelInfo || {})
        }, { quoted: message });
        
        // Success reaction
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        
    } catch (error) {
        console.error('Dice command error:', error);
        
        const diceResult = Math.floor(Math.random() * 6) + 1;
        await sock.sendMessage(chatId, {
            text: `🎲 *Dice Roll:* ${diceResult}`,
            ...(global.channelInfo || {})
        }, { quoted: message });
        
        await sock.sendMessage(chatId, { react: { text: '🎲', key: message.key } });
    }
}

module.exports = diceCommand;