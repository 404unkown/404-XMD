module.exports = {
    async requestlist(sock, chatId, message, isGroup, isSenderAdmin, isBotAdmin) {
        try {
            // Send processing reaction
            await sock.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            if (!isGroup) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ This command can only be used in groups.",
                    quoted: message 
                });
                return;
            }

            if (!isSenderAdmin) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ Only group admins can use this command.",
                    quoted: message 
                });
                return;
            }

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ I need to be an admin to view join requests.",
                    quoted: message 
                });
                return;
            }

            // Note: groupRequestParticipantsList might not be available in all Baileys versions
            // This is an alternative approach
            try {
                // Try to get pending requests
                const requests = await sock.groupRequestParticipantsList(chatId);
                
                if (!requests || requests.length === 0) {
                    await sock.sendMessage(chatId, { 
                        react: { text: 'ℹ️', key: message.key } 
                    });
                    await sock.sendMessage(chatId, { 
                        text: "ℹ️ No pending join requests.",
                        quoted: message 
                    });
                    return;
                }

                let text = `📋 *Pending Join Requests (${requests.length})*\n\n`;
                requests.forEach((user, i) => {
                    text += `${i+1}. @${user.jid.split('@')[0]}\n`;
                });

                await sock.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                
                await sock.sendMessage(chatId, {
                    text: text,
                    mentions: requests.map(u => u.jid),
                    quoted: message
                });

            } catch (apiError) {
                console.error("API error:", apiError);
                // Fallback message
                await sock.sendMessage(chatId, { 
                    react: { text: '⚠️', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "⚠️ Group request feature might not be available in this version.\n\n*Alternative:* Use WhatsApp's built-in group request management.",
                    quoted: message 
                });
            }

        } catch (error) {
            console.error("Request list error:", error);
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await sock.sendMessage(chatId, { 
                text: "❌ Failed to fetch join requests.",
                quoted: message 
            });
        }
    },

    async acceptall(sock, chatId, message, isGroup, isSenderAdmin, isBotAdmin) {
        try {
            await sock.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            if (!isGroup) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ This command can only be used in groups.",
                    quoted: message 
                });
                return;
            }

            if (!isSenderAdmin) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ Only group admins can use this command.",
                    quoted: message 
                });
                return;
            }

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ I need to be an admin to accept join requests.",
                    quoted: message 
                });
                return;
            }

            try {
                const requests = await sock.groupRequestParticipantsList(chatId);
                
                if (!requests || requests.length === 0) {
                    await sock.sendMessage(chatId, { 
                        react: { text: 'ℹ️', key: message.key } 
                    });
                    await sock.sendMessage(chatId, { 
                        text: "ℹ️ No pending join requests to accept.",
                        quoted: message 
                    });
                    return;
                }

                const jids = requests.map(u => u.jid);
                await sock.groupRequestParticipantsUpdate(chatId, jids, "approve");
                
                await sock.sendMessage(chatId, { 
                    react: { text: '👍', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: `✅ Successfully accepted ${requests.length} join requests.`,
                    quoted: message 
                });

            } catch (apiError) {
                console.error("API error:", apiError);
                await sock.sendMessage(chatId, { 
                    react: { text: '⚠️', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "⚠️ This feature requires bot to have admin permissions and latest Baileys version.",
                    quoted: message 
                });
            }

        } catch (error) {
            console.error("Accept all error:", error);
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await sock.sendMessage(chatId, { 
                text: "❌ Failed to accept join requests.",
                quoted: message 
            });
        }
    },

    async rejectall(sock, chatId, message, isGroup, isSenderAdmin, isBotAdmin) {
        try {
            await sock.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            if (!isGroup) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ This command can only be used in groups.",
                    quoted: message 
                });
                return;
            }

            if (!isSenderAdmin) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ Only group admins can use this command.",
                    quoted: message 
                });
                return;
            }

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "❌ I need to be an admin to reject join requests.",
                    quoted: message 
                });
                return;
            }

            try {
                const requests = await sock.groupRequestParticipantsList(chatId);
                
                if (!requests || requests.length === 0) {
                    await sock.sendMessage(chatId, { 
                        react: { text: 'ℹ️', key: message.key } 
                    });
                    await sock.sendMessage(chatId, { 
                        text: "ℹ️ No pending join requests to reject.",
                        quoted: message 
                    });
                    return;
                }

                const jids = requests.map(u => u.jid);
                await sock.groupRequestParticipantsUpdate(chatId, jids, "reject");
                
                await sock.sendMessage(chatId, { 
                    react: { text: '👎', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: `✅ Successfully rejected ${requests.length} join requests.`,
                    quoted: message 
                });

            } catch (apiError) {
                console.error("API error:", apiError);
                await sock.sendMessage(chatId, { 
                    react: { text: '⚠️', key: message.key } 
                });
                await sock.sendMessage(chatId, { 
                    text: "⚠️ This feature requires bot to have admin permissions and latest Baileys version.",
                    quoted: message 
                });
            }

        } catch (error) {
            console.error("Reject all error:", error);
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await sock.sendMessage(chatId, { 
                text: "❌ Failed to reject join requests.",
                quoted: message 
            });
        }
    }
};