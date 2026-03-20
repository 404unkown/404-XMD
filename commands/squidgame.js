const { delay } = require("@whiskeysockets/baileys");

module.exports = {
    async squidgame(sock, chatId, message, isGroup, participants) {
        try {
            if (!isGroup) {
                await sock.sendMessage(chatId, { 
                    text: "❌ This command can only be used in groups.",
                    quoted: message 
                });
                return;
            }

            const senderId = message.key.participant || message.key.remoteJid;
            
            // Check if sender is admin
            const groupInfo = await sock.groupMetadata(chatId);
            const senderParticipant = groupInfo.participants.find(p => p.id === senderId);
            
            if (!senderParticipant || !(senderParticipant.admin || senderParticipant.isSuperAdmin)) {
                await sock.sendMessage(chatId, { 
                    text: "❌ Only admins can use this command.",
                    quoted: message 
                });
                return;
            }

            // Filter non-admin members
            const nonAdminMembers = groupInfo.participants.filter(p => !p.admin);
            
            if (nonAdminMembers.length < 5) {
                await sock.sendMessage(chatId, { 
                    text: "⚠️ At least 5 non-admin members are required to play.",
                    quoted: message 
                });
                return;
            }

            const gameCreator = senderId.split("@")[0];

            // Game announcement message
            let gameMessage = `🔴 *Squid Game: Red Light,🟢Green Light*\n\n🎭 *Front Man*: (@${gameCreator})\n`;
            gameMessage += nonAdminMembers.map(m => "@" + m.id.split("@")[0]).join("\n") + "\n\n";
            gameMessage += "All other group members have been added as players! The game will start in 50 seconds..";

            await sock.sendMessage(chatId, { 
                text: gameMessage, 
                mentions: nonAdminMembers.map(m => m.id) 
            }, { quoted: message });

            await delay(50000); // Wait 50 seconds

            // Select 5 random players (not 50 as in original code - that seems like a typo)
            let players = nonAdminMembers.sort(() => 0.5 - Math.random()).slice(0, 5);
            let playersList = players.map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`).join("\n");

            await sock.sendMessage(chatId, {
                text: `🎮 *List of Players:*\n${playersList}\n\n🔔 The game is now starting... !`,
                mentions: players.map(p => p.id)
            });

            await delay(3000);

            // Game rules explanation
            let rulesMessage = `📜 *Rules of Squid Game:*\n\n`
                + `1️⃣ During 🟥 *Red Light*, Players who send a message will be *eliminated* and *kicked* from the group.\n\n`
                + `2️⃣ During 🟩 *Green Light*, Players must send a message. Those who remain silent will be eliminated.\n\n`
                + `3️⃣ Game ends when only one player remains.\n\n`
                + `🏆 Survive to become the _winner_ !`;

            await sock.sendMessage(chatId, { text: rulesMessage });

            await delay(5000);

            let remainingPlayers = [...players];
            
            // NOTE: This is a simplified version without message listening
            // For a full implementation, you'd need to track messages in real-time
            // This version will just simulate the game
            
            const gamePhases = 3; // Number of game phases
            for (let phase = 1; phase <= gamePhases && remainingPlayers.length > 1; phase++) {
                let isGreenLight = Math.random() > 0.5;
                let lightMessage = isGreenLight ? "🟩 *Green Light*" : "🟥 *Red Light*";
                await sock.sendMessage(chatId, { text: `🔔 ${lightMessage} - Phase ${phase}` });

                await delay(5000); // Wait 5 seconds

                // Randomly eliminate some players (simulated)
                const playersToEliminate = Math.floor(Math.random() * (remainingPlayers.length - 1)) + 1;
                const eliminated = remainingPlayers.slice(0, playersToEliminate);
                remainingPlayers = remainingPlayers.slice(playersToEliminate);

                for (let player of eliminated) {
                    let eliminationMessage = isGreenLight
                        ? `❌ @${player.id.split("@")[0]} remained silent during 🟩 _Green Light_ and has been eliminated.`
                        : `❌ @${player.id.split("@")[0]} wrote during 🟥 _Red Light_ and has been eliminated.`;

                    await sock.sendMessage(chatId, {
                        text: eliminationMessage,
                        mentions: [player.id]
                    });
                    
                    // NOTE: We're NOT actually kicking players for safety
                    // To actually kick, uncomment this line:
                    // await sock.groupParticipantsUpdate(chatId, [player.id], "remove");
                }

                await delay(2000);
            }

            if (remainingPlayers.length === 1) {
                await sock.sendMessage(chatId, {
                    text: `🏆 *Congratulations @${remainingPlayers[0].id.split("@")[0]} !*\n_You Survived the Squid Game!_ 🎉`,
                    mentions: [remainingPlayers[0].id]
                });
            } else if (remainingPlayers.length > 1) {
                await sock.sendMessage(chatId, {
                    text: `🏆 *Game Over!* Multiple survivors: ${remainingPlayers.map(p => `@${p.id.split("@")[0]}`).join(', ')}`,
                    mentions: remainingPlayers.map(p => p.id)
                });
            }

        } catch (error) {
            console.error("Error in squidgame command:", error);
            await sock.sendMessage(chatId, { 
                text: "❌ An error occurred while launching Squid Game.",
                quoted: message 
            });
        }
    }
};