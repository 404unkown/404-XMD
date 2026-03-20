const fs = require('fs');
const path = require('path');
const os = require('os');
const isOwnerOrSudo = require('../lib/isOwner');

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: '404 XMD',
            serverMessageId: -1
        }
    }
};

async function clearSessionCommand(sock, chatId, msg) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        // Get the session owner ID (the person who owns this bot session)
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if the sender is the session owner
        if (senderId !== ownerId && !msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ You can only clear your own session files!\n\nEach user has their own session directory.',
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        // Define session directory path - now using the session owner's ID to identify their session folder
        // In a multi-user setup, sessions are stored in the main session directory
        // but each user has their own auth state within it
        const sessionDir = path.join(__dirname, '../session');
        
        // Also check for user-specific session subdirectory if your multi-user setup uses them
        const userSessionDir = path.join(__dirname, `../sessions/${ownerId.replace(/[^a-zA-Z0-9@._-]/g, '_')}`);

        if (!fs.existsSync(sessionDir)) {
            await sock.sendMessage(chatId, { 
                text: '❌ Session directory not found!',
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        let filesCleared = 0;
        let errors = 0;
        let errorDetails = [];
        let filesKept = 0;

        // Send initial status
        await sock.sendMessage(chatId, { 
            text: `🔍 Optimizing session files for YOUR session...`,
            ...channelInfo
        }, { quoted: msg });

        const files = fs.readdirSync(sessionDir);
        
        // Count files by type for optimization
        let appStateSyncCount = 0;
        let preKeyCount = 0;
        let keptFilesCount = 0;

        for (const file of files) {
            if (file.startsWith('app-state-sync-')) appStateSyncCount++;
            if (file.startsWith('pre-key-')) preKeyCount++;
        }

        // Delete files while preserving creds.json and any user-specific files
        for (const file of files) {
            const filePath = path.join(sessionDir, file);
            
            // CRITICAL FILES TO KEEP:
            // 1. creds.json - contains the authentication credentials
            // 2. Any files that might be specific to other users in a multi-session setup
            
            const isCriticalFile = file === 'creds.json';
            
            if (isCriticalFile) {
                keptFilesCount++;
                filesKept++;
                continue;
            }
            
            try {
                fs.unlinkSync(filePath);
                filesCleared++;
            } catch (error) {
                errors++;
                errorDetails.push(`Failed to delete ${file}: ${error.message}`);
            }
        }

        // Also clear user-specific session directory if it exists
        if (fs.existsSync(userSessionDir)) {
            try {
                const userFiles = fs.readdirSync(userSessionDir);
                for (const file of userFiles) {
                    const filePath = path.join(userSessionDir, file);
                    try {
                        fs.unlinkSync(filePath);
                        filesCleared++;
                    } catch (err) {
                        console.log(`Could not delete ${file}: ${err.message}`);
                    }
                }
                // Try to remove the directory itself (will only work if empty)
                try {
                    fs.rmdirSync(userSessionDir);
                } catch (err) {
                    // Directory not empty, ignore
                }
            } catch (err) {
                console.log('Error clearing user session dir:', err.message);
            }
        }

        // Send completion message
        const message = `✅ *Your Session Files Cleared Successfully!*\n\n` +
                       `📊 *Statistics for YOUR session:*\n` +
                       `• Files cleared: ${filesCleared}\n` +
                       `• App state sync files: ${appStateSyncCount}\n` +
                       `• Pre-key files: ${preKeyCount}\n` +
                       `• Critical files kept: ${filesKept} (creds.json)\n` +
                       (errors > 0 ? `\n⚠️ Errors: ${errors}\n${errorDetails.slice(0, 3).join('\n')}` : '') +
                       `\n\n🔄 *Note:* Your bot will need to reconnect using existing credentials.`;

        await sock.sendMessage(chatId, { 
            text: message,
            ...channelInfo
        }, { quoted: msg });

        // Add a small delay then force reconnect if needed
        setTimeout(async () => {
            try {
                await sock.sendMessage(chatId, { 
                    text: '🔄 Reconnecting with cleaned session...',
                    ...channelInfo
                });
                // Force a connection update
                sock.ev.emit('connection.update', { connection: 'close', lastDisconnect: null });
            } catch (e) {
                // Ignore
            }
        }, 2000);

    } catch (error) {
        console.error('Error in clearsession command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to clear session files!',
            ...channelInfo
        }, { quoted: msg });
    }
}

module.exports = clearSessionCommand;