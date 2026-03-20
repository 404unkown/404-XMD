async function openCommand(sock, chatId, senderId) {
    try {
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        await sock.sendMessage(chatId, { text: '✅ Group has been opened (unmuted)!' });
    } catch (error) {
        console.error('Error opening group:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to open group. Make sure bot is admin.' });
    }
}

module.exports = openCommand;