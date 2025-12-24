// lib/isOwner.js

module.exports = async function isOwnerOrSudo(senderId, sock, chatId) {
    try {
        // The owner is the person whose WhatsApp account the bot is logged into
        const botOwnerJid = sock.user?.id;
        
        // Check if the sender is the bot itself OR the bot owner
        if (senderId === botOwnerJid) {
            return true;
        }
        
        // Optional: You could add a sudo list here (for other admins)
        // Example: Load sudo numbers from a JSON file
        // const sudoNumbers = ['254769769295', '254712345678'];
        // const senderNumber = senderId.split('@')[0];
        // if (sudoNumbers.includes(senderNumber)) return true;
        
        return false;
    } catch (error) {
        console.error('Error in isOwnerOrSudo:', error);
        return false;
    }
};