const axios = require('axios');
const fetch = require('node-fetch');

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text ||
                     message.message?.imageMessage?.caption ||
                     message.message?.videoMessage?.caption ||
                     '';

        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "🤖 *AI Command Usage*\n\n" +
                      "• .gpt [question]\n" +
                      "• .gemini [question]\n" +
                      "• .claude [question]\n" +
                      "• .deepseek [question]\n" +
                      "• .mistral [question]\n" +
                      "• .cohere [question]\n" +
                      "• .phind [question]\n" +
                      "• .perplexity [question]\n" +
                      "• .pi [question]\n" +
                      "• .coral [question]\n" +
                      "• .mythal [question]\n" +
                      "• .llama [question]\n\n" +
                      "*Example:* .gpt write a basic html code"
            }, { quoted: message });
        }

        // Get the command and query
        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Please provide a question after the AI command.\n\n" +
                      "*Example:* .gpt write a basic html code"
            }, { quoted: message });
        }

        // Show processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '🤖', key: message.key } 
        });

        let responseText = '';
        let apiUrl = '';

        // Handle different AI commands
        switch (command) {
            case '.gpt':
                apiUrl = `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    if (response.data?.status && response.data?.result) {
                        responseText = response.data.result;
                    } else {
                        throw new Error('Invalid response from GPT API');
                    }
                } catch (error) {
                    // Fallback API
                    apiUrl = `https://api.ryzendesu.vip/api/ai/gpt4?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'No response from GPT';
                }
                break;

            case '.gemini':
                const geminiApis = [
                    `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                    `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                    `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`,
                    `https://api.lyzer.tech/ai/gemini?text=${encodeURIComponent(query)}`
                ];

                for (const api of geminiApis) {
                    try {
                        const response = await axios.get(api, { timeout: 10000 });
                        const data = response.data;
                        if (data.message || data.data || data.answer || data.result || data.response) {
                            responseText = data.message || data.data || data.answer || data.result || data.response;
                            break;
                        }
                    } catch (e) {
                        console.log(`Gemini API ${api} failed:`, e.message);
                        continue;
                    }
                }
                
                if (!responseText) {
                    throw new Error('All Gemini APIs failed');
                }
                break;

            case '.claude':
                apiUrl = `https://api.ryzendesu.vip/api/ai/claude?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Claude';
                } catch (error) {
                    // Fallback
                    apiUrl = `https://api.lyzer.tech/ai/claude?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Claude API unavailable';
                }
                break;

            case '.deepseek':
                apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from DeepSeek';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/deepseek?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'DeepSeek API unavailable';
                }
                break;

            case '.mistral':
                apiUrl = `https://api.ryzendesu.vip/api/ai/mistral?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Mistral';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/mistral?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Mistral API unavailable';
                }
                break;

            case '.cohere':
                apiUrl = `https://api.ryzendesu.vip/api/ai/cohere?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Cohere';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/cohere?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Cohere API unavailable';
                }
                break;

            case '.phind':
                apiUrl = `https://api.ryzendesu.vip/api/ai/phind?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Phind';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/phind?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Phind API unavailable';
                }
                break;

            case '.perplexity':
                apiUrl = `https://api.ryzendesu.vip/api/ai/perplexity?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Perplexity';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/perplexity?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Perplexity API unavailable';
                }
                break;

            case '.pi':
                apiUrl = `https://api.ryzendesu.vip/api/ai/pi?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Pi AI';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/pi?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Pi AI API unavailable';
                }
                break;

            case '.coral':
                apiUrl = `https://api.ryzendesu.vip/api/ai/coral?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Coral';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/coral?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Coral API unavailable';
                }
                break;

            case '.mythal':
                apiUrl = `https://api.ryzendesu.vip/api/ai/mythal?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Mythal';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/mythal?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Mythal API unavailable';
                }
                break;

            case '.llama':
                apiUrl = `https://api.ryzendesu.vip/api/ai/llama?text=${encodeURIComponent(query)}`;
                try {
                    const response = await axios.get(apiUrl);
                    responseText = response.data?.result || response.data?.message || 'No response from Llama';
                } catch (error) {
                    apiUrl = `https://api.lyzer.tech/ai/llama?text=${encodeURIComponent(query)}`;
                    const fallback = await axios.get(apiUrl);
                    responseText = fallback.data?.result || fallback.data?.message || 'Llama API unavailable';
                }
                break;

            default:
                return await sock.sendMessage(chatId, {
                    text: `❌ Unknown AI command: ${command}\n\n` +
                          "Available commands:\n" +
                          "• .gpt\n• .gemini\n• .claude\n• .deepseek\n• .mistral\n" +
                          "• .cohere\n• .phind\n• .perplexity\n• .pi\n• .coral\n" +
                          "• .mythal\n• .llama\n\n" +
                          "*Example:* .gpt write a basic html code"
                }, { quoted: message });
        }

        // Trim and format response
        if (responseText) {
            // Limit response length to avoid WhatsApp limits
            if (responseText.length > 4000) {
                responseText = responseText.substring(0, 4000) + "\n\n[Response truncated due to length]";
            }
            
            // Add AI name to response
            const aiName = command.slice(1).toUpperCase();
            const formattedResponse = `*🤖 ${aiName} AI Response:*\n\n${responseText}\n\n_Powered by 404-XMD Bot_`;
            
            await sock.sendMessage(chatId, {
                text: formattedResponse
            }, { quoted: message });

            // Success reaction
            await sock.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } else {
            throw new Error('Empty response from AI');
        }

    } catch (error) {
        console.error('AI Command Error:', error);
        
        // Error reaction
        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });

        await sock.sendMessage(chatId, {
            text: `❌ *AI Service Error*\n\n` +
                  `Command: ${text.split(' ')[0]}\n` +
                  `Error: ${error.message || 'Service temporarily unavailable'}\n\n` +
                  `Please try again in a few moments or use a different AI command.`
        }, { quoted: message });
    }
}

module.exports = aiCommand;