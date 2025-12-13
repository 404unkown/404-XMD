const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "Please provide a valid WhatsApp number\nExample: .pair 254769769295\nOr: .pair 254769769295,254700000000",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            });
        }

        const numbers = q.split(',')
            .map((v) => v.trim().replace(/[^0-9]/g, ''))
            .filter((v) => v.length > 5 && v.length < 20)
            .map(num => {
                // Ensure proper WhatsApp format
                if (!num.startsWith('0') && !num.startsWith('1') && !num.startsWith('2')) {
                    // Assume it needs country code - adjust as needed
                    return '254' + num.replace(/^0+/, '');
                }
                return num.replace(/^0+/, ''); // Remove leading zeros
            });

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid number format!\nPlease use: .pair 254769769295",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            });
        }

        // Send initial processing message
        await sock.sendMessage(chatId, {
            text: `🔄 Processing ${numbers.length} number(s)...`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        });

        for (const number of numbers) {
            try {
                const whatsappID = number.includes('@') ? number : number + '@s.whatsapp.net';
                
                // Check if number exists on WhatsApp
                const result = await sock.onWhatsApp(whatsappID);
                
                if (!result || !result[0]?.exists) {
                    await sock.sendMessage(chatId, {
                        text: `❌ ${number}: Not registered on WhatsApp`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401269012709@newsletter',
                                newsletterName: '404 XMD',
                                serverMessageId: -1
                            }
                        }
                    });
                    continue; // Continue with next number instead of returning
                }

                await sock.sendMessage(chatId, {
                    text: `⏳ Generating code for ${number}...`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: '404 XMD',
                            serverMessageId: -1
                        }
                    }
                });

                // Try API call
                try {
                    const response = await axios.get(`https://four04-the-goat.onrender.com/code?number=${number}`, {
                        timeout: 10000 // 10 second timeout
                    });
                    
                    if (response.data && response.data.code) {
                        const code = response.data.code;
                        
                        if (code === "Service Unavailable" || code.includes("Error") || code.includes("unavailable")) {
                            throw new Error('Service Unavailable');
                        }
                        
                        await sleep(3000);
                        
                        await sock.sendMessage(chatId, {
                            text: `✅ *Pairing Code for ${number}*\nCode: \`${code}\``,
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363401269012709@newsletter',
                                    newsletterName: '404 XMD',
                                    serverMessageId: -1
                                }
                            }
                        });
                        
                        // Optional: Add small delay between numbers
                        if (numbers.length > 1) {
                            await sleep(2000);
                        }
                        
                    } else {
                        throw new Error('Invalid response from server');
                    }
                } catch (apiError) {
                    console.error(`API Error for ${number}:`, apiError.message);
                    
                    // Alternative API endpoint (if available)
                    // const altResponse = await axios.get(`https://api.example.com/code/${number}`);
                    
                    const errorMessage = apiError.message === 'Service Unavailable' 
                        ? `❌ ${number}: Service unavailable. Try again later.`
                        : `❌ ${number}: Failed to generate code. ${apiError.message}`;
                    
                    await sock.sendMessage(chatId, {
                        text: errorMessage,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401269012709@newsletter',
                                newsletterName: '404 XMD',
                                serverMessageId: -1
                            }
                        }
                    });
                }
                
            } catch (error) {
                console.error(`Error processing ${number}:`, error);
                await sock.sendMessage(chatId, {
                    text: `⚠️ Error processing ${number}: ${error.message}`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: '404 XMD',
                            serverMessageId: -1
                        }
                    }
                });
            }
        }
        
        // Final message
        await sock.sendMessage(chatId, {
            text: "✅ Pairing process completed!",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        });
        
    } catch (error) {
        console.error('Global error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ Critical error: ${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = pairCommand;