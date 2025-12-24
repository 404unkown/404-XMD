const stylizedChars = {
  a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
  h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
  o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
  v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
  '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
  '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

module.exports = async (conn, chatId, message) => {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        // SIMPLE OWNER CHECK - Replace with your actual owner number
        const ownerNumber = "+254769769295"; // Change this to your number
        const ownerJid = ownerNumber.replace('+', '').replace(/\s/g, '') + '@s.whatsapp.net';
        
        if (!message.key.fromMe && senderId !== ownerJid) {
            await conn.sendMessage(chatId, { 
                text: '🚫 *Owner-only command*' 
            }, { quoted: message });
            return;
        }

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            ''
        );

        const args = userMessage.split(' ').slice(1);
        
        if (args.length < 2) {
            return await conn.sendMessage(chatId, {
                text: `⚠️ *Usage:*\n.channelreact https://whatsapp.com/channel/<id>/<msg-id> <text>`,
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

        const link = args[0];
        const inputText = args.slice(1).join(' ').toLowerCase();

        if (!link.includes("whatsapp.com/channel/")) {
            return await conn.sendMessage(chatId, {
                text: "❌ *Invalid link!*\nMake sure it's a WhatsApp channel message link.",
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

        const urlSegments = link.split('/');
        const channelId = urlSegments[4];
        const messageId = urlSegments[5];

        if (!channelId || !messageId) {
            return await conn.sendMessage(chatId, {
                text: "❎ *Link missing channel or message ID.*",
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

        // Stylize the text
        const emoji = inputText.split('').map(char => {
            if (char === ' ') return '―';
            return stylizedChars[char] || char;
        }).join('');

        // Fetch channel info and send the reaction
        const channelMeta = await conn.newsletterMetadata("invite", channelId);
        await conn.newsletterReactMessage(channelMeta.id, messageId, emoji);

        await conn.sendMessage(chatId, {
            text: `
╭━━〔 *404-XMD*⚡ 〕━⬣
┃✨ *Reaction sent successfully!*
┃📡 *Channel:* ${channelMeta.name}
┃💬 *Reaction:* ${emoji}
╰──────────────⬣
> 🔗 *Powered By 404TECH* 🔥`,
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

    } catch (error) {
        console.error('Error in channelreact command:', error);
        
        let errorMessage = "⚠️ *Error:* An unexpected error occurred.";
        
        if (error.message.includes("Cannot find module")) {
            errorMessage = "⚠️ *Setup Error:* Owner check module missing. Command updated.";
        } else if (error.message.includes("newsletter")) {
            errorMessage = "⚠️ *Channel Error:* Cannot access channel. Make sure you're subscribed.";
        }
        
        await conn.sendMessage(chatId, {
            text: errorMessage,
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