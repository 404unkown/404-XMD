const fs = require('fs');
const path = require('path');

// Import isAdmin function
const isAdmin = require('../lib/isAdmin');

module.exports = async (sock, chatId, message, args) => {
    try {
        // Check if this is a group chat
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
            }, { quoted: message });
            return;
        }
        
        // Get sender ID from message
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Check if user is admin in the group
        const adminStatus = await isAdmin(sock, chatId, senderId);
        
        // Only allow admins to toggle anti-spam (except bot owner)
        const isBotOwner = message.key.fromMe || await require('../lib/isOwner')(senderId, sock, chatId);
        
        if (!adminStatus.isSenderAdmin && !isBotOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ Only group admins can use this command!',
                mentions: [senderId]
            }, { quoted: message });
            return;
        }
        
        // Check if bot is admin (required for anti-spam to work)
        if (!adminStatus.isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to use anti-spam feature!',
            }, { quoted: message });
            return;
        }
        
        // Handle help or status check
        const action = args?.[0]?.toLowerCase();
        
        if (action === 'status' || action === 'check') {
            const settingsPath = path.join(__dirname, '../settings.js');
            let settingsContent = fs.readFileSync(settingsPath, 'utf8');
            
            const isEnabled = settingsContent.includes("ANTI_SPAM: 'true'");
            
            await sock.sendMessage(chatId, {
                text: `🔒 *Anti-spam Status*\n\nCurrent status: ${isEnabled ? 'ENABLED ✅' : 'DISABLED ❌'}\n\nUse ${global.PREFIX || '.'}antispam to toggle on/off.`,
            }, { quoted: message });
            return;
        }
        
        // Check if ANTI_SPAM setting exists
        const settingsPath = path.join(__dirname, '../settings.js');
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        if (!settingsContent.includes('ANTI_SPAM:')) {
            // Add the setting if it doesn't exist
            settingsContent = settingsContent.replace(
                'module.exports = {',
                `module.exports = {\n    ANTI_SPAM: 'true',`
            );
            fs.writeFileSync(settingsPath, settingsContent);
            
            await sock.sendMessage(chatId, {
                text: `✅ *Anti-spam Enabled*\n\nAnti-spam setting has been added and enabled!\n\nTo disable: ${global.PREFIX || '.'}antispam`,
            }, { quoted: message });
            return;
        }
        
        // Check current state
        const isEnabled = settingsContent.includes("ANTI_SPAM: 'true'");
        
        // Toggle the value
        if (isEnabled) {
            settingsContent = settingsContent.replace(
                "ANTI_SPAM: 'true'",
                "ANTI_SPAM: 'false'"
            );
        } else {
            settingsContent = settingsContent.replace(
                "ANTI_SPAM: 'false'",
                "ANTI_SPAM: 'true'"
            );
        }
        
        fs.writeFileSync(settingsPath, settingsContent);
        
        // Clear require cache so new settings are loaded
        delete require.cache[require.resolve(settingsPath)];
        
        await sock.sendMessage(chatId, {
            text: `✅ *Anti-spam Updated*\n\nAnti-spam has been ${!isEnabled ? 'ENABLED ✅' : 'DISABLED ❌'}!`,
        }, { quoted: message });
        
        // Send additional info about anti-spam system
        if (!isEnabled) { // If we just enabled it
            setTimeout(async () => {
                await sock.sendMessage(chatId, {
                    text: `ℹ️ *Anti-spam System Info*\n\n• Detects spam messages (8 messages in 5 seconds)\n• Issues warnings to spammers\n• Auto-mutes after 3 warnings (2 minutes)\n• Only admins can toggle this setting`,
                }, { quoted: message });
            }, 1000);
        }
        
    } catch (error) {
        console.error('Error toggling anti-spam:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to toggle anti-spam!',
        }, { quoted: message });
    }
};