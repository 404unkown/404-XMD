const axios = require('axios');

module.exports = async function defineCommand(sock, chatId, message, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: "📝 *Usage:* .define [word]\n\nExample: `.define hello`",
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

        const word = args.join(' ');
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const response = await axios.get(url);
        const definitionData = response.data[0];

        if (!definitionData) {
            await sock.sendMessage(chatId, {
                text: `❌ *Word not found:* "${word}"\nPlease check the spelling and try again.`,
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
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Get the first meaning and definition
        const definition = definitionData.meanings[0]?.definitions[0]?.definition || 'No definition available';
        const example = definitionData.meanings[0]?.definitions[0]?.example || 'No example available';
        const synonyms = definitionData.meanings[0]?.definitions[0]?.synonyms?.slice(0, 5).join(', ') || 'No synonyms available';
        const antonyms = definitionData.meanings[0]?.definitions[0]?.antonyms?.slice(0, 5).join(', ') || 'No antonyms available';
        const phonetics = definitionData.phonetics[0]?.text || definitionData.phonetic || 'No pronunciation available';
        const audio = definitionData.phonetics.find(p => p.audio)?.audio || null;

        // Format the response
        const wordInfo = `
📖 *Word:* ${definitionData.word}
🗣️ *Pronunciation:* ${phonetics}
📚 *Part of Speech:* ${definitionData.meanings[0]?.partOfSpeech || 'N/A'}

🔍 *Definition:*
${definition}

✍️ *Example:*
${example}

📝 *Synonyms:* ${synonyms}
🚫 *Antonyms:* ${antonyms}

💡 *Powered by 404 TECH*`;

        // Send audio pronunciation if available
        if (audio) {
            try {
                await sock.sendMessage(chatId, { 
                    audio: { url: audio }, 
                    mimetype: 'audio/mpeg',
                    ptt: true 
                }, { quoted: message });
            } catch (audioError) {
                console.log('Audio sending failed, continuing with text only');
            }
        }

        await sock.sendMessage(chatId, {
            text: wordInfo,
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

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("❌ Define command error:", error);
        
        if (error.response && error.response.status === 404) {
            await sock.sendMessage(chatId, {
                text: `❌ *Word not found*\n\nPlease check the spelling and try again.`,
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
            await sock.sendMessage(chatId, {
                text: `⚠️ *Error fetching definition*\n\nPlease try again later.`,
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
        
        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};