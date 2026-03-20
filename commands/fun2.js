const config = require('../settings');

module.exports = {
    async compatibility(sock, chatId, message, args) {
        try {
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (mentionedJid.length < 2) {
                await sock.sendMessage(chatId, { 
                    text: "Please mention two users to calculate compatibility.\nUsage: `.compatibility @user1 @user2`",
                    quoted: message 
                });
                return;
            }

            let user1 = mentionedJid[0]; 
            let user2 = mentionedJid[1]; 
            const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

            // Calculate a random compatibility score (between 1 to 1000)
            let compatibilityScore = Math.floor(Math.random() * 1000) + 1;

            // Check if one of the mentioned users is the special number
            if (user1 === specialNumber || user2 === specialNumber) {
                compatibilityScore = 1000; // Special case for DEV number
                await sock.sendMessage(chatId, {
                    text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}+/1000 💖`,
                    mentions: [user1, user2],
                }, { quoted: message });
                return;
            }

            // Send the compatibility message
            await sock.sendMessage(chatId, {
                text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}/1000 💖`,
                mentions: [user1, user2],
            }, { quoted: message });

        } catch (error) {
            console.log(error);
            await sock.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}`,
                quoted: message 
            });
        }
    },

    async aura(sock, chatId, message, args) {
        try {
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (mentionedJid.length < 1) {
                await sock.sendMessage(chatId, { 
                    text: "Please mention a user to calculate their aura.\nUsage: `.aura @user`",
                    quoted: message 
                });
                return;
            }

            let user = mentionedJid[0]; 
            const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

            // Calculate a random aura score (between 1 to 1000)
            let auraScore = Math.floor(Math.random() * 1000) + 1;

            // Check if the mentioned user is the special number
            if (user === specialNumber) {
                auraScore = 999999; // Special case for DEV number
                await sock.sendMessage(chatId, {
                    text: `💀 Aura of @${user.split('@')[0]}: ${auraScore}+ 🗿`,
                    mentions: [user],
                }, { quoted: message });
                return;
            }

            // Send the aura message
            await sock.sendMessage(chatId, {
                text: `💀 Aura of @${user.split('@')[0]}: ${auraScore}/1000 🗿`,
                mentions: [user],
            }, { quoted: message });

        } catch (error) {
            console.log(error);
            await sock.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}`,
                quoted: message 
            });
        }
    },

    async eightBall(sock, chatId, message, args) {
        try {
            const userMessage = message.message?.conversation?.trim() ||
                message.message?.extendedTextMessage?.text?.trim() || '';
            
            const question = userMessage.replace('.8ball', '').trim();
            
            if (!question) {
                await sock.sendMessage(chatId, { 
                    text: "Ask a yes/no question! Example: .8ball Will I be rich?",
                    quoted: message 
                });
                return;
            }
            
            let responses = [
                "Yes!", "No.", "Maybe...", "Definitely!", "Not sure.", 
                "Ask again later.", "I don't think so.", "Absolutely!", 
                "No way!", "Looks promising!"
            ];
            
            let answer = responses[Math.floor(Math.random() * responses.length)];
            
            await sock.sendMessage(chatId, {
                text: `🎱 *Magic 8-Ball says:* ${answer}\n\n*Question:* ${question}`,
                quoted: message
            });

        } catch (error) {
            console.log(error);
            await sock.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}`,
                quoted: message 
            });
        }
    },

    async compliment(sock, chatId, message, args) {
        try {
            let compliments = [
                "You're amazing just the way you are! 💖",
                "You light up every room you walk into! 🌟",
                "Your smile is contagious! 😊",
                "You're a genius in your own way! 🧠",
                "You bring happiness to everyone around you! 🥰",
                "You're like a human sunshine! ☀️",
                "Your kindness makes the world a better place! ❤️",
                "You're unique and irreplaceable! ✨",
                "You're a great listener and a wonderful friend! 🤗",
                "Your positive vibes are truly inspiring! 💫",
                "You're stronger than you think! 💪",
                "Your creativity is beyond amazing! 🎨",
                "You make life more fun and interesting! 🎉",
                "Your energy is uplifting to everyone around you! 🔥",
                "You're a true leader, even if you don't realize it! 🏆",
                "Your words have the power to make people smile! 😊",
                "You're so talented, and the world needs your skills! 🎭",
                "You're a walking masterpiece of awesomeness! 🎨",
                "You're proof that kindness still exists in the world! 💕",
                "You make even the hardest days feel a little brighter! ☀️"
            ];

            let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
            const senderId = message.key.participant || message.key.remoteJid;
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedSender = quotedMsg?.participant || quotedMsg?.key?.remoteJid;
            
            let target = mentionedJid[0] || quotedSender;
            const senderName = senderId.split('@')[0];
            const targetName = target ? target.split('@')[0] : null;

            let messageText;
            if (target) {
                messageText = `@${senderName} complimented @${targetName}:\n😊 *${randomCompliment}*`;
            } else {
                messageText = `@${senderName}, you forgot to tag someone! But hey, here's a compliment for you:\n😊 *${randomCompliment}*`;
                target = senderId; // Mention sender instead
            }

            await sock.sendMessage(chatId, { 
                text: messageText, 
                mentions: [senderId, target].filter(Boolean) 
            }, { quoted: message });

        } catch (error) {
            console.log(error);
            await sock.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}`,
                quoted: message 
            });
        }
    },

    async lovetest(sock, chatId, message, args) {
        try {
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (mentionedJid.length < 2) {
                await sock.sendMessage(chatId, { 
                    text: "Tag two users! Example: .lovetest @user1 @user2",
                    quoted: message 
                });
                return;
            }

            let user1 = mentionedJid[0];
            let user2 = mentionedJid[1];

            let lovePercent = Math.floor(Math.random() * 100) + 1; // Generates a number between 1-100

            let messages = [
                { range: [90, 100], text: "💖 *A match made in heaven!* True love exists!" },
                { range: [75, 89], text: "😍 *Strong connection!* This love is deep and meaningful." },
                { range: [50, 74], text: "😊 *Good compatibility!* You both can make it work." },
                { range: [30, 49], text: "🤔 *It's complicated!* Needs effort, but possible!" },
                { range: [10, 29], text: "😅 *Not the best match!* Maybe try being just friends?" },
                { range: [1, 9], text: "💔 *Uh-oh!* This love is as real as a Bollywood breakup!" }
            ];

            let loveMessage = messages.find(msg => lovePercent >= msg.range[0] && lovePercent <= msg.range[1]).text;

            let messageText = `💘 *Love Compatibility Test* 💘\n\n❤️ *@${user1.split("@")[0]}* + *@${user2.split("@")[0]}* = *${lovePercent}%*\n${loveMessage}`;

            await sock.sendMessage(chatId, { 
                text: messageText, 
                mentions: [user1, user2] 
            }, { quoted: message });

        } catch (error) {
            console.log(error);
            await sock.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}`,
                quoted: message 
            });
        }
    },

    async emoji(sock, chatId, message, args) {
        try {
            // Join the words together in case the user enters multiple words
            let text = args.join(" ");
            
            // Map text to corresponding emoji characters
            let emojiMapping = {
                "a": "🅰️",
                "b": "🅱️",
                "c": "🇨️",
                "d": "🇩️",
                "e": "🇪️",
                "f": "🇫️",
                "g": "🇬️",
                "h": "🇭️",
                "i": "🇮️",
                "j": "🇯️",
                "k": "🇰️",
                "l": "🇱️",
                "m": "🇲️",
                "n": "🇳️",
                "o": "🅾️",
                "p": "🇵️",
                "q": "🇶️",
                "r": "🇷️",
                "s": "🇸️",
                "t": "🇹️",
                "u": "🇺️",
                "v": "🇻️",
                "w": "🇼️",
                "x": "🇽️",
                "y": "🇾️",
                "z": "🇿️",
                "0": "0️⃣",
                "1": "1️⃣",
                "2": "2️⃣",
                "3": "3️⃣",
                "4": "4️⃣",
                "5": "5️⃣",
                "6": "6️⃣",
                "7": "7️⃣",
                "8": "8️⃣",
                "9": "9️⃣",
                " ": "␣", // for space
            };

            // Convert the input text into emoji form
            let emojiText = text.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

            // If no valid text is provided
            if (!text) {
                await sock.sendMessage(chatId, { 
                    text: "Please provide some text to convert into emojis!\nUsage: .emoji hello world",
                    quoted: message 
                });
                return;
            }

            await sock.sendMessage(chatId, {
                text: emojiText,
            }, { quoted: message });

        } catch (error) {
            console.log(error);
            await sock.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}`,
                quoted: message 
            });
        }
    }
};