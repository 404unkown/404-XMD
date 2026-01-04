const { delay } = require("@whiskeysockets/baileys");
const isAdmin = require('../lib/isAdmin'); // Import the same admin check

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
            const isOwner = message.key.fromMe;
            
            // Use the SAME admin check as kick command
            if (!isOwner) {
                const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { 
                        text: "❌ I need to be an admin to kick players!",
                        quoted: message 
                    });
                    return;
                }

                if (!isSenderAdmin) {
                    await sock.sendMessage(chatId, { 
                        text: "❌ Only admins can start Squid Game.",
                        quoted: message 
                    });
                    return;
                }
            }

            const groupInfo = await sock.groupMetadata(chatId);
            
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
            gameMessage += "📋 *Players:*\n" + nonAdminMembers.map((m, i) => `${i+1}. @${m.id.split("@")[0]}`).join("\n");
            gameMessage += "\n\n⚠️ *WARNING:* This is a REAL elimination game! Players who break rules WILL BE KICKED!";
            gameMessage += "\n\n⏳ The game will start in 30 seconds...";

            await sock.sendMessage(chatId, { 
                text: gameMessage, 
                mentions: nonAdminMembers.map(m => m.id) 
            });

            await delay(30000); // Wait 30 seconds

            // Select random players (5-10 players for optimal gameplay)
            const numPlayers = Math.min(10, Math.max(5, nonAdminMembers.length));
            let players = nonAdminMembers.sort(() => 0.5 - Math.random()).slice(0, numPlayers);
            let playersList = players.map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`).join("\n");

            await sock.sendMessage(chatId, {
                text: `🎮 *Selected Players (${players.length}):*\n${playersList}\n\n🔔 The game is now starting... !`,
                mentions: players.map(p => p.id)
            });

            await delay(3000);

            // Game rules explanation
            let rulesMessage = `📜 *Rules of Squid Game:*\n\n`
                + `🟥 *RED LIGHT*: DO NOT SEND ANY MESSAGE!\n• If you send ANY message (text, image, video, sticker, etc.), you WILL BE KICKED IMMEDIATELY!\n\n`
                + `🟩 *GREEN LIGHT*: YOU MUST SEND A MESSAGE!\n• You must send at least one message before time ends\n• If you don't send anything, you WILL BE KICKED!\n\n`
                + `⏰ *Time Limit:* 10 seconds per round\n`
                + `🏆 Last player remaining wins!`;

            await sock.sendMessage(chatId, { text: rulesMessage });

            await delay(5000);

            let remainingPlayers = [...players];
            let messageTracker = new Map(); // Track who sent messages
            
            const gameRounds = 5; // Number of game rounds
            
            for (let round = 1; round <= gameRounds && remainingPlayers.length > 1; round++) {
                // Clear tracker for new round
                messageTracker.clear();
                for (let player of remainingPlayers) {
                    messageTracker.set(player.id, false);
                }
                
                let isGreenLight = Math.random() > 0.5;
                let lightMessage = isGreenLight ? "🟩 *GREEN LIGHT*" : "🟥 *RED LIGHT*";
                
                await sock.sendMessage(chatId, { 
                    text: `⏱️ *Round ${round}/${gameRounds}*\n${lightMessage}\n\n${isGreenLight ? "✅ SEND A MESSAGE NOW!" : "❌ DO NOT SEND ANYTHING!"}\n\n⏰ 10 seconds...`,
                    mentions: remainingPlayers.map(p => p.id)
                });
                
                let roundStartTime = Date.now();
                let roundEndTime = roundStartTime + 10000; // 10 seconds
                
                // Set up a message listener for this round
                let messageHandler;
                
                // Create promise to handle message listening
                const messagePromise = new Promise((resolve) => {
                    messageHandler = async (msg) => {
                        if (msg.key.remoteJid !== chatId) return;
                        
                        const sender = msg.key.participant || msg.key.remoteJid;
                        const currentTime = Date.now();
                        
                        // Only process messages during game time
                        if (currentTime > roundStartTime && currentTime < roundEndTime) {
                            // Track that this player sent a message
                            if (messageTracker.has(sender)) {
                                messageTracker.set(sender, true);
                            }
                        }
                    };
                    
                    // Register the listener
                    sock.ev.on('messages.upsert', messageHandler);
                });

                // Wait for the round duration
                await delay(10000);
                
                // Remove the listener
                sock.ev.off('messages.upsert', messageHandler);
                
                // Process eliminations
                let eliminatedPlayers = [];
                let survivors = [];
                
                for (let player of remainingPlayers) {
                    const playerSentMessage = messageTracker.get(player.id);
                    
                    if (isGreenLight) {
                        // GREEN LIGHT: Must send message
                        if (!playerSentMessage) {
                            eliminatedPlayers.push(player);
                            try {
                                // KICK THE PLAYER
                                await sock.groupParticipantsUpdate(chatId, [player.id], "remove");
                                await sock.sendMessage(chatId, {
                                    text: `❌ @${player.id.split("@")[0]} was ELIMINATED! (Did not send message during Green Light) 🚫`,
                                    mentions: [player.id]
                                });
                            } catch (kickError) {
                                console.error("Failed to kick:", kickError);
                                await sock.sendMessage(chatId, {
                                    text: `⚠️ Failed to kick @${player.id.split("@")[0]}, but they are eliminated from the game.`,
                                    mentions: [player.id]
                                });
                                eliminatedPlayers.push(player);
                            }
                        } else {
                            survivors.push(player);
                        }
                    } else {
                        // RED LIGHT: Must NOT send message
                        if (playerSentMessage) {
                            eliminatedPlayers.push(player);
                            try {
                                // KICK THE PLAYER
                                await sock.groupParticipantsUpdate(chatId, [player.id], "remove");
                                await sock.sendMessage(chatId, {
                                    text: `❌ @${player.id.split("@")[0]} was ELIMINATED! (Sent message during Red Light) 🚫`,
                                    mentions: [player.id]
                                });
                            } catch (kickError) {
                                console.error("Failed to kick:", kickError);
                                await sock.sendMessage(chatId, {
                                    text: `⚠️ Failed to kick @${player.id.split("@")[0]}, but they are eliminated from the game.`,
                                    mentions: [player.id]
                                });
                                eliminatedPlayers.push(player);
                            }
                        } else {
                            survivors.push(player);
                        }
                    }
                }
                
                // Update remaining players
                remainingPlayers = survivors;
                
                // Round summary
                if (remainingPlayers.length > 0) {
                    await sock.sendMessage(chatId, {
                        text: `📊 *Round ${round} Results:*\n`
                            + `🟢 Survivors: ${remainingPlayers.length}\n`
                            + `🔴 Eliminated: ${eliminatedPlayers.length}\n`
                            + `${remainingPlayers.length > 0 ? `\n👥 Still in game: ${remainingPlayers.map(p => `@${p.id.split("@")[0]}`).join(', ')}` : ''}`,
                        mentions: remainingPlayers.map(p => p.id)
                    });
                }
                
                if (remainingPlayers.length <= 1) break;
                
                await delay(3000); // Pause between rounds
            }
            
            // Game conclusion
            if (remainingPlayers.length === 1) {
                const winner = remainingPlayers[0];
                await sock.sendMessage(chatId, {
                    text: `🎉 🎉 🎉\n\n🏆 *CONGRATULATIONS @${winner.id.split("@")[0]}!*\n\n_You are the SOLE SURVIVOR of the Squid Game!_\n\n💰 Prize: Eternal glory and bragging rights! 🎉`,
                    mentions: [winner.id]
                });
            } else if (remainingPlayers.length > 1) {
                await sock.sendMessage(chatId, {
                    text: `🏁 *Game Over!*\n\nMultiple survivors:\n${remainingPlayers.map(p => `🎖️ @${p.id.split("@")[0]}`).join('\n')}\n\nWell played everyone!`,
                    mentions: remainingPlayers.map(p => p.id)
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `💀 *Game Over!*\n\nEVERYONE WAS ELIMINATED!\n\nThe Squid Game has no winner this time...`
                });
            }

        } catch (error) {
            console.error("Error in squidgame command:", error);
            await sock.sendMessage(chatId, { 
                text: `❌ An error occurred while running Squid Game: ${error.message}`,
                quoted: message 
            });
        }
    }
};