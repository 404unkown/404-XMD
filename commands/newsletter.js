module.exports = async (conn, chatId, message) => {
    try {
        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            ''
        ).toLowerCase();

        const args = userMessage.split(' ').slice(1).join(' ');
        
        if (!args) {
            return await conn.sendMessage(chatId, {
                text: `❎ *Please provide a WhatsApp Channel link.*\n\n📌 *Example:*\n.newsletter https://whatsapp.com/channel/xxxxxxxxxx`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '🪀『 40R XMD 』🪀',
                        serverMessageId: 143
                    }
                }
            }, { quoted: message });
        }

        const match = args.match(/whatsapp\.com\/channel\/([\w-]+)/);
        if (!match) {
            return await conn.sendMessage(chatId, {
                text: `⚠️ *Invalid channel link!*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '🪀『 404 XMD 』🪀',
                        serverMessageId: 143
                    }
                }
            }, { quoted: message });
        }

        const inviteId = match[1];
        let metadata;

        try {
            metadata = await conn.newsletterMetadata("invite", inviteId);
        } catch (err) {
            return await conn.sendMessage(chatId, {
                text: "🚫 *Failed to fetch channel info.*\nDouble-check the link and try again.",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '🪀『 404 XMD 』🪀',
                        serverMessageId: 143
                    }
                }
            }, { quoted: message });
        }

        if (!metadata?.id) {
            return await conn.sendMessage(chatId, {
                text: "❌ *Channel not found or inaccessible.*",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '🪀『 404 XMD 』🪀',
                        serverMessageId: 143
                    }
                }
            }, { quoted: message });
        }

        const infoText = `
╭─❍『 📡 ᴄʜᴀɴɴᴇʟ ɪɴꜰᴏ 』❍─
│
│ 🔖 *ID:* ${metadata.id}
│ 🗂️ *Name:* ${metadata.name}
│ 👥 *Followers:* ${metadata.subscribers?.toLocaleString() || "N/A"}
│ 🗓️ *Created:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString("id-ID") : "Unknown"}
│
╰─⭓ Powered By *404TECH*
`;

        if (metadata.preview) {
            await conn.sendMessage(chatId, {
                image: { url: `https://pps.whatsapp.net${metadata.preview}` },
                caption: infoText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '🪀『 404 XMD 』🪀',
                        serverMessageId: 143
                    }
                }
            }, { quoted: message });
        } else {
            await conn.sendMessage(chatId, {
                text: infoText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '🪀『 404 XMD 』🪀',
                        serverMessageId: 143
                    }
                }
            }, { quoted: message });
        }

    } catch (error) {
        console.error('❌ Newsletter Error:', error);
        await conn.sendMessage(chatId, {
            text: "⚠️ *An unexpected error occurred while fetching the channel info.*",
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '🪀『 404 XMD 』🪀',
                    serverMessageId: 143
                }
            }
        }, { quoted: message });
    }
};