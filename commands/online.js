module.exports = {
    async online(sock, chatId, message, isGroup) {
        try {
            if (!isGroup) {
                await sock.sendMessage(chatId, {
                    text: "❌ This command can only be used in a group!",
                    quoted: message
                });
                return;
            }

            // 1. Get group metadata (list of all members)
            const groupData = await sock.groupMetadata(chatId);
            const allMembers = groupData.participants;

            // 2. Try to load recent messages (e.g., last 100)
            let recentSenders = new Set();
            try {
                const recentMessages = await sock.loadMessages(chatId, 100); // Adjust limit
                recentMessages.forEach(msg => {
                    if (msg.key?.participant) {
                        recentSenders.add(msg.key.participant);
                    }
                });
            } catch (msgError) {
                console.log("Could not load message history:", msgError.message);
            }

            // 3. Categorize members
            const activeList = [];   // Recently messaged
            const inactiveList = []; // Haven't messaged recently
            const adminList = [];

            allMembers.forEach(member => {
                const userId = member.id;
                const name = member.name || member.notify || userId.split('@')[0];
                const isAdmin = member.admin !== null;

                const entry = `• @${userId.split('@')[0]} (${name})`;
                
                if (isAdmin) adminList.push(entry);
                if (recentSenders.has(userId)) {
                    activeList.push(entry);
                } else {
                    inactiveList.push(entry);
                }
            });

            // 4. Format and send the results (be honest about the method)
            const report = `
👥 *Group Activity Report* 👥

📊 *Total Members:* ${allMembers.length}
🟢 *Recently Active:* ${activeList.length} (sent a message in the last ~100 chats)
⚫ *Not Recently Seen:* ${inactiveList.length}
👑 *Admins:* ${adminList.length}

⚠️ *Note:* This is an **estimate** based on recent chat history.
WhatsApp does not provide real-time "online" status in groups.

> *Powered by 404-XMD*
            `.trim();

            await sock.sendMessage(chatId, { text: report, quoted: message });

            // Optional: Send detailed lists if not too long
            if (activeList.length > 0 && activeList.length < 25) {
                await sock.sendMessage(chatId, {
                    text: `🟢 *Recently Active Members:*\n${activeList.join('\n')}`,
                    mentions: allMembers.filter(m => recentSenders.has(m.id)).map(m => m.id)
                });
            }

        } catch (error) {
            console.error('Error in activity command:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Could not check activity: ${error.message}`,
                quoted: message
            });
        }
    }
};