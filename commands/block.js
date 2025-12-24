const fs = require('fs');
const path = require('path');

module.exports = async function blockCommand(sock, chatId, message) {
    try {
        // Check if user is bot owner (adjust this logic to match your owner system)
        const sender = message.key.participant || message.key.remoteJid;
        const ownerNumber = "+254769769295"; // Replace with your actual number
        const ownerJid = ownerNumber.replace('+', '').replace(/\s/g, '') + '@s.whatsapp.net';
        
        // Check if sender is owner (you might need to adjust this based on your setup)
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
                text: "❌ Usage:\n• Reply to user's message with .block\n• Mention user: .block @user\n• Or use: .block 254769769295",
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

        // Block the user
        try {
            await sock.updateBlockStatus(targetJid, "block");
            await sock.sendMessage(chatId, { 
                text: `✅ Successfully blocked user.\n📱 Number: ${targetJid.split('@')[0]}`,
                quoted: message 
            });
            
            // Optional: Add to blocked list file
            try {
                const blockedPath = path.join(__dirname, '../data/blocked.json');
                let blockedUsers = [];
                
                if (fs.existsSync(blockedPath)) {
                    blockedUsers = JSON.parse(fs.readFileSync(blockedPath, 'utf8'));
                }
                
                if (!blockedUsers.includes(targetJid)) {
                    blockedUsers.push(targetJid);
                    fs.writeFileSync(blockedPath, JSON.stringify(blockedUsers, null, 2));
                }
            } catch (fileError) {
                console.log("Note: Could not save to blocked list file");
            }
            
        } catch (blockError) {
            console.error("Block API error:", blockError);
            await sock.sendMessage(chatId, { 
                text: "❌ Failed to block user. They might already be blocked or the number is invalid.",
                quoted: message 
            });
        }

    } catch (error) {
        console.error("Block command error:", error);
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}\n\n💡 Make sure you have the correct permissions.`,
            quoted: message 
        });
    }
};