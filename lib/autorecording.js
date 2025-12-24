const fs = require('fs');

// Function to handle auto-recording
async function autoRecording(sock, message) {
    try {
        const chatId = message.key.remoteJid;
        const from = chatId;
        
        // Check if auto-recording is enabled in settings
        const settings = require('../settings');
        if (settings.AUTO_RECORDING !== 'true') {
            return; // Auto-recording is disabled
        }
        
        // Check if it's a valid message (not a status update or group notification)
        if (!message.message) return;
        
        // Check message type - only set recording for certain messages
        const hasText = message.message.conversation || 
                       message.message.extendedTextMessage?.text ||
                       message.message.imageMessage?.caption ||
                       message.message.videoMessage?.caption;
        
        const hasMedia = message.message.imageMessage || 
                        message.message.videoMessage || 
                        message.message.audioMessage ||
                        message.message.documentMessage;
        
        if (hasText || hasMedia) {
            // Set recording presence for 2 seconds
            await sock.sendPresenceUpdate('recording', from);
            
            // Automatically stop recording after 2 seconds
            setTimeout(async () => {
                await sock.sendPresenceUpdate('paused', from);
            }, 6000);
        }
    } catch (error) {
        console.error('Auto-recording error:', error.message);
    }
}

// Export the function
module.exports = { autoRecording };