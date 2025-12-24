const fs = require('fs');
const path = require('path');

module.exports = async function unblockCommand(sock, chatId, message) {
    try {
        // Check if user is bot owner
        const sender = message.key.participant || message.key.remoteJid;
        const ownerNumber = "+254769769295"; // Replace with your actual number
        const ownerJid = ownerNumber.replace('+', '').replace(/\s/g, '') + '@s.whatsapp.net';
        
        // Check if sender is owner
        if (sender !== ownerJid) {
            await sock.sendMessage(chatId, { 
                text: "❌ Only the bot owner can use this command.",
                quoted: message 
            });
            return;
        }

        // Extract target user JID
        let targetJid;
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || '';
        
        // Check for quoted message
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        }
        // Check for mentioned users
        else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Check for text with @ mention
        else if (text.match(/@\d+/)) {
            const number = text.match(/@(\d+)/)[1];
            targetJid = number + '@s.whatsapp.net';
        }
        // Check for direct number in text
        else if (text.match(/\d{10,}/)) {
            const number = text.match(/(\d{10,})/)[1];
            targetJid = number + '@s.whatsapp.net';
        }
        else {
            await sock.sendMessage(chatId, { 
                text: "❌ Usage:\n• Reply to user's message with .unblock\n• Mention user: .unblock @user\n• Or use: .unblock 254769769295",
                quoted: message 
            });
            return;
        }

        // Validate JID format
        if (!targetJid || !targetJid.includes('@s.whatsapp.net')) {
            await sock.sendMessage(chatId, { 
                text: "❌ Invalid user format. Please provide a valid WhatsApp number.",
                quoted: message 
            });
            return;
        }

        // Unblock the user
        try {
            await sock.updateBlockStatus(targetJid, "unblock");
            await sock.sendMessage(chatId, { 
                text: `✅ Successfully unblocked user.\n📱 Number: ${targetJid.split('@')[0]}`,
                quoted: message 
            });
            
            // Optional: Remove from blocked list file
            try {
                const blockedPath = path.join(__dirname, '../data/blocked.json');
                
                if (fs.existsSync(blockedPath)) {
                    let blockedUsers = JSON.parse(fs.readFileSync(blockedPath, 'utf8'));
                    blockedUsers = blockedUsers.filter(jid => jid !== targetJid);
                    fs.writeFileSync(blockedPath, JSON.stringify(blockedUsers, null, 2));
                }
            } catch (fileError) {
                console.log("Note: Could not update blocked list file");
            }
            
        } catch (unblockError) {
            console.error("Unblock API error:", unblockError);
            await sock.sendMessage(chatId, { 
                text: "❌ Failed to unblock user. They might not be blocked or the number is invalid.",
                quoted: message 
            });
        }

    } catch (error) {
        console.error("Unblock command error:", error);
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`,
            quoted: message 
        });
    }
};