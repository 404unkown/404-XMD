const axios = require('axios');

async function aivoiceCommand(sock, chatId, message, args) {
    try {
        // Get the full input text
        const inputText = args.join(' ');
        
        if (!inputText.trim()) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide text after the command.\nExample: .aivoice hello world',
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

        // Voice model menu
        const voiceModels = [
            { number: "1", name: "Hatsune Miku", model: "miku" },
            { number: "2", name: "Nahida (Exclusive)", model: "nahida" },
            { number: "3", name: "Nami", model: "nami" },
            { number: "4", name: "Ana (Female)", model: "ana" },
            { number: "5", name: "Optimus Prime", model: "optimus_prime" },
            { number: "6", name: "Goku", model: "goku" },
            { number: "7", name: "Taylor Swift", model: "taylor_swift" },
            { number: "8", name: "Elon Musk", model: "elon_musk" },
            { number: "9", name: "Mickey Mouse", model: "mickey_mouse" },
            { number: "10", name: "Kendrick Lamar", model: "kendrick_lamar" },
            { number: "11", name: "Angela Adkinsh", model: "angela_adkinsh" },
            { number: "12", name: "Eminem", model: "eminem" }
        ];

        // Create menu text
        let menuText = "╭━━━〔 *AI VOICE MODELS* 〕━━━⊷\n";
        voiceModels.forEach(model => {
            menuText += `┃▸ ${model.number}. ${model.name}\n`;
        });
        menuText += "╰━━━⪼\n\n";
        menuText += `📌 *Reply with the number to select voice model for:*\n"${inputText}"\n\n⏰ *Timeout: 2 minutes*`;

        // Send menu message with image
        await sock.sendMessage(chatId, {
            image: { url: "https://files.catbox.moe/4itzeu.jpg" },
            caption: menuText,
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

        // Store the selection data for this chat
        const selectionData = {
            inputText: inputText,
            models: voiceModels,
            timestamp: Date.now(),
            messageId: message.key.id
        };

        // Store in a temporary object (in production, use a database)
        if (!global.voiceSelections) global.voiceSelections = {};
        global.voiceSelections[chatId] = selectionData;

        // Auto-clean after 2 minutes
        setTimeout(() => {
            if (global.voiceSelections[chatId] === selectionData) {
                delete global.voiceSelections[chatId];
            }
        }, 120000);

    } catch (error) {
        console.error('Error in aivoice command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
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
    }
}

// Function to handle voice selection replies
async function handleVoiceSelection(sock, chatId, senderId, userMessage, message) {
    try {
        // Check if we're waiting for a voice selection in this chat
        if (!global.voiceSelections || !global.voiceSelections[chatId]) {
            return false;
        }

        const selectionData = global.voiceSelections[chatId];
        
        // Check if this is a reply to our menu message
        const repliedTo = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
        if (repliedTo !== selectionData.messageId) {
            return false;
        }

        // Check if message is just a number
        const selectedNumber = userMessage.trim();
        if (!/^\d+$/.test(selectedNumber)) {
            return false;
        }

        const selectedModel = selectionData.models.find(model => model.number === selectedNumber);
        
        if (!selectedModel) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid option! Please reply with a number from the menu.',
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
            return true;
        }

        // Remove selection data
        delete global.voiceSelections[chatId];

        // Show processing message
        await sock.sendMessage(chatId, {
            text: `🔊 Generating audio with *${selectedModel.name}* voice...`,
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

        // Call the API
        const apiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(selectionData.inputText)}&model=${selectedModel.model}`;
        const response = await axios.get(apiUrl, {
            timeout: 30000 // 30 seconds timeout
        });

        const data = response.data;

        if (data.status === 200 && data.data?.oss_url) {
            await sock.sendMessage(chatId, {
                audio: { url: data.data.oss_url },
                mimetype: "audio/mpeg",
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
        } else {
            throw new Error('API returned invalid response');
        }

        return true;
        
    } catch (error) {
        console.error('Error handling voice selection:', error);
        
        // Clean up selection data on error
        if (global.voiceSelections && global.voiceSelections[chatId]) {
            delete global.voiceSelections[chatId];
        }
        
        await sock.sendMessage(chatId, {
            text: '❌ Error generating audio. Please try again.',
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
        
        return true;
    }
}

module.exports = {
    aivoiceCommand,
    handleVoiceSelection
};