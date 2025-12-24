const fs = require('fs');
const path = require('path');

module.exports = async (sock, chatId, message, rawText) => {
    try {
        // Extract the poll text (remove ".poll " prefix)
        const pollText = rawText.slice(5).trim();
        
        // Check if there's any text after .poll
        if (!pollText) {
            await sock.sendMessage(chatId, {
                text: '📊 *Usage:* .poll question;option1,option2,option3...\n\n*Example:*\n.poll Best programming language?;JavaScript,Python,Java,C++\n.poll Favorite color?;Red,Blue,Green,Yellow',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Split question and options
        const parts = pollText.split(';');
        
        if (parts.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ *Invalid format!*\n\nUse: .poll question;option1,option2,option3...\n\n*Example:*\n.poll Best programming language?;JavaScript,Python,Java',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        const question = parts[0].trim();
        const optionsString = parts[1].trim();
        
        if (!question) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a question!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Parse options
        const options = optionsString.split(',')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);

        // Validate options
        if (options.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide at least 2 options!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        if (options.length > 12) {
            await sock.sendMessage(chatId, {
                text: '❌ Maximum 12 options allowed!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Create the poll
        await sock.sendMessage(chatId, {
            poll: {
                name: question,
                values: options,
                selectableCount: 1, // Users can select only one option
                toAnnouncementGroup: true // Announce in group
            }
        }, { quoted: message });

        // Add success reaction
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('❌ Error creating poll:', error);
        
        await sock.sendMessage(chatId, {
            text: `❌ Failed to create poll: ${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        
        // Add error reaction
        await sock.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
};