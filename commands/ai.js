const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Conversation memory storage
const conversationMemory = new Map();
const MEMORY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Enhanced AI APIs with priorities
const AI_APIS = {
    GPT: [
        { url: 'https://api.ryzendesu.vip/api/ai/gpt4', param: 'text', extract: 'result' },
        { url: 'https://api.lyzer.tech/ai/gpt', param: 'text', extract: 'result' },
        { url: 'https://zellapi.autos/ai/chatbot', param: 'text', extract: 'result' }
    ],
    GEMINI: [
        { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', param: 'contents', method: 'POST', headers: true, extract: 'candidates[0].content.parts[0].text' },
        { url: 'https://api.siputzx.my.id/api/ai/gemini-pro', param: 'content', extract: 'response' },
        { url: 'https://vapis.my.id/api/gemini', param: 'q', extract: 'response' }
    ],
    CLAUDE: [
        { url: 'https://api.anthropic.com/v1/messages', method: 'POST', headers: true, extract: 'content[0].text' },
        { url: 'https://api.ryzendesu.vip/api/ai/claude', param: 'text', extract: 'result' }
    ],
    DEEPSEEK: [
        { url: 'https://api.deepseek.com/v1/chat/completions', method: 'POST', headers: true, extract: 'choices[0].message.content' },
        { url: 'https://api.ryzendesu.vip/api/ai/deepseek', param: 'text', extract: 'result' }
    ]
};

// Configuration for API keys (you should add your own)
const API_KEYS = {
    GEMINI: 'AIzaSyCVjFCM78h23fjberjSmk5zM3J34FOHJ9w',
    CLAUDE: 'YOUR_CLAUDE_API_KEY',
    DEEPSEEK: 'YOUR_DEEPSEEK_API_KEY'
};

async function callAIWithFallback(aiType, query, imageUrl = null) {
    const apis = AI_APIS[aiType] || AI_APIS.GPT;
    
    for (const api of apis) {
        try {
            let response;
            const timeout = 15000; // 15 seconds timeout
            
            if (api.method === 'POST') {
                const payload = buildPayload(api, query, imageUrl, aiType);
                const headers = api.headers ? buildHeaders(aiType) : {};
                
                response = await axios.post(api.url, payload, { 
                    headers, 
                    timeout 
                });
            } else {
                const url = buildUrl(api, query);
                response = await axios.get(url, { timeout });
            }
            
            const result = extractResponse(response.data, api.extract);
            if (result && result.trim()) {
                console.log(`✅ ${aiType} API success: ${api.url}`);
                return result;
            }
        } catch (error) {
            console.log(`❌ ${aiType} API failed: ${api.url} - ${error.message}`);
            continue;
        }
    }
    
    throw new Error(`All ${aiType} APIs failed`);
}

function buildPayload(api, query, imageUrl, aiType) {
    switch (aiType) {
        case 'GEMINI':
            return {
                contents: [{
                    parts: imageUrl ? 
                        [{ text: query }, { inline_data: { mime_type: "image/jpeg", data: imageUrl } }] :
                        [{ text: query }]
                }]
            };
        case 'CLAUDE':
            return {
                model: "claude-3-opus-20240229",
                max_tokens: 1000,
                messages: [{ role: "user", content: query }]
            };
        case 'DEEPSEEK':
            return {
                model: "deepseek-chat",
                messages: [{ role: "user", content: query }],
                max_tokens: 2000
            };
        default:
            return { prompt: query };
    }
}

function buildHeaders(aiType) {
    const headers = { 'Content-Type': 'application/json' };
    
    switch (aiType) {
        case 'GEMINI':
            headers['x-goog-api-key'] = API_KEYS.GEMINI;
            break;
        case 'CLAUDE':
            headers['x-api-key'] = API_KEYS.CLAUDE;
            headers['anthropic-version'] = '2023-06-01';
            break;
        case 'DEEPSEEK':
            headers['Authorization'] = `Bearer ${API_KEYS.DEEPSEEK}`;
            break;
    }
    
    return headers;
}

function buildUrl(api, query) {
    return `${api.url}?${api.param}=${encodeURIComponent(query)}`;
}

function extractResponse(data, extractPath) {
    if (!extractPath) return data?.result || data?.message || data?.response || data;
    
    // Handle nested extraction like 'candidates[0].content.parts[0].text'
    const paths = extractPath.split('.');
    let result = data;
    
    for (const path of paths) {
        const match = path.match(/(\w+)\[(\d+)\]/);
        if (match) {
            const [, arrayName, index] = match;
            if (result[arrayName] && result[arrayName][index]) {
                result = result[arrayName][index];
            } else {
                return null;
            }
        } else if (result[path] !== undefined) {
            result = result[path];
        } else {
            return null;
        }
    }
    
    return result;
}

// Conversation management
function getConversationId(chatId, senderId) {
    return `${chatId}:${senderId}`;
}

function getConversationHistory(convoId) {
    const history = conversationMemory.get(convoId);
    if (!history) return null;
    
    // Clear expired conversations
    if (Date.now() - history.timestamp > MEMORY_TIMEOUT) {
        conversationMemory.delete(convoId);
        return null;
    }
    
    return history.messages;
}

function updateConversationHistory(convoId, userMessage, aiResponse) {
    const history = conversationMemory.get(convoId) || { 
        messages: [], 
        timestamp: Date.now() 
    };
    
    // Keep last 10 messages for context
    history.messages.push({ role: 'user', content: userMessage });
    history.messages.push({ role: 'assistant', content: aiResponse });
    
    if (history.messages.length > 20) {
        history.messages = history.messages.slice(-20);
    }
    
    history.timestamp = Date.now();
    conversationMemory.set(convoId, history);
}

// Enhanced query processing
function enhanceQuery(query, history) {
    if (!history || history.length === 0) return query;
    
    // Build context from history
    const context = history.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
    
    return `Previous conversation:\n${context}\n\nCurrent query: ${query}`;
}

// Intelligent response formatting
function formatResponse(text, aiName, query) {
    // Clean up response
    let cleaned = text.trim();
    
    // Remove common AI prefixes
    const prefixes = [
        "Sure!", "Certainly!", "Here's", "I'd be happy", 
        "The answer is", "According to", "In summary"
    ];
    
    for (const prefix of prefixes) {
        if (cleaned.startsWith(prefix)) {
            cleaned = cleaned.slice(prefix.length).trim();
            break;
        }
    }
    
    // Format based on query type
    const isCodeQuery = query.includes('code') || query.includes('program') || 
                        query.includes('function') || query.includes('script');
    
    const isListQuery = query.startsWith('list') || query.includes('steps') || 
                        query.includes('advantages') || query.includes('disadvantages');
    
    if (isCodeQuery) {
        // Format code blocks
        const codeMatch = cleaned.match(/```(\w+)?\n([\s\S]+?)```/);
        if (codeMatch) {
            const language = codeMatch[1] || '';
            const code = codeMatch[2];
            cleaned = `*Code (${language || 'text'}):*\n\`\`\`${language}\n${code}\n\`\`\``;
        }
    } else if (isListQuery) {
        // Format lists
        cleaned = cleaned.replace(/\n\d+\./g, '\n•');
        cleaned = cleaned.replace(/\n\s*[-•*]\s*/g, '\n• ');
    }
    
    // Truncate if too long
    const MAX_LENGTH = 3500;
    if (cleaned.length > MAX_LENGTH) {
        cleaned = cleaned.substring(0, MAX_LENGTH) + 
                 `\n\n[Response truncated. ${cleaned.length - MAX_LENGTH} characters omitted.]`;
    }
    
    return `*🤖 ${aiName} AI*\n\n${cleaned}\n\n_💡 Tip: Use .clear to reset conversation_`;
}

// Main AI command
async function aiCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const convoId = getConversationId(chatId, senderId);
        
        // Extract text and handle commands
        let text = '';
        if (message.message?.conversation) {
            text = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            text = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage?.caption) {
            text = message.message.imageMessage.caption;
        } else if (message.message?.videoMessage?.caption) {
            text = message.message.videoMessage.caption;
        }
        
        // Handle clear command
        if (text === '.clear' || text === '.reset') {
            conversationMemory.delete(convoId);
            await sock.sendMessage(chatId, {
                text: "✅ *Conversation memory cleared!*\n\nStarting fresh conversation.",
                quoted: message
            });
            return;
        }
        
        // Handle help
        if (!text || text === '.ai' || text === '.help ai') {
            const helpText = `*🤖 ENHANCED AI COMMANDS*\n
*Basic Usage:*
• .gpt [question] - GPT-4 model
• .gemini [question] - Google Gemini
• .claude [question] - Claude AI
• .deepseek [question] - DeepSeek AI
• .ai list - Show all available AIs

*Advanced Features:*
• *Conversation Memory* - AI remembers last 10 messages
• *Image Support* - Send images with captions
• *Code Formatting* - Automatic code block detection
• .clear - Reset conversation memory

*Examples:*
• .gpt explain quantum computing
• .gemini write python code for calculator
• Send image with caption ".gemini describe this"
• .clear (reset conversation)

*Powered by multiple AI APIs with automatic fallback*`;
            
            return await sock.sendMessage(chatId, { 
                text: helpText,
                quoted: message 
            });
        }
        
        // Handle AI list
        if (text === '.ai list') {
            const aiList = `*🤖 AVAILABLE AI MODELS*\n
1. *GPT-4* (.gpt) - Most versatile, good for general tasks
2. *Gemini Pro* (.gemini) - Best for code and reasoning
3. *Claude* (.claude) - Excellent for creative writing
4. *DeepSeek* (.deepseek) - Great for technical questions
5. *Mistral* (.mistral) - Fast and efficient
6. *Cohere* (.cohere) - Business-focused responses
7. *Phind* (.phind) - Developer-oriented
8. *Perplexity* (.perplexity) - Research-focused with citations
9. *Llama* (.llama) - Open-source model
10. *Coral* (.coral) - Creative tasks

*Usage:* .[model] [your question]
*Example:* .gemini write a sorting algorithm`;
            
            return await sock.sendMessage(chatId, { 
                text: aiList,
                quoted: message 
            });
        }
        
        // Parse command and query
        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        let query = parts.slice(1).join(' ').trim();
        
        // Check for image attachment
        let imageUrl = null;
        if (message.message?.imageMessage) {
            imageUrl = await downloadImage(sock, message.message.imageMessage);
            if (!query && message.message.imageMessage.caption) {
                query = message.message.imageMessage.caption;
            } else if (!query) {
                query = "Describe this image";
            }
        }
        
        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Please provide a question after the AI command.\n\n" +
                      "*Example:* .gpt explain machine learning\n" +
                      "Or send an image with caption: .gemini describe this",
                quoted: message 
            });
        }
        
        // Show processing
        await sock.sendMessage(chatId, { 
            react: { text: '🤖', key: message.key } 
        });
        
        // Get conversation history
        const history = getConversationHistory(convoId);
        const enhancedQuery = enhanceQuery(query, history);
        
        // Map commands to AI types
        const commandMap = {
            '.gpt': 'GPT',
            '.gemini': 'GEMINI',
            '.claude': 'CLAUDE',
            '.deepseek': 'DEEPSEEK',
            '.mistral': 'GPT', // Fallback to GPT
            '.cohere': 'GPT',
            '.phind': 'GPT',
            '.perplexity': 'GPT',
            '.pi': 'GPT',
            '.coral': 'GPT',
            '.mythal': 'GPT',
            '.llama': 'GPT'
        };
        
        const aiType = commandMap[command];
        if (!aiType) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unknown AI command: ${command}\n\n` +
                      "Use .ai list to see all available models",
                quoted: message 
            });
        }
        
        // Call AI
        const responseText = await callAIWithFallback(aiType, enhancedQuery, imageUrl);
        
        // Update conversation history
        updateConversationHistory(convoId, query, responseText);
        
        // Format and send response
        const aiName = command.slice(1).toUpperCase();
        const formattedResponse = formatResponse(responseText, aiName, query);
        
        await sock.sendMessage(chatId, {
            text: formattedResponse,
            quoted: message
        });
        
        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });
        
    } catch (error) {
        console.error('Enhanced AI Command Error:', error);
        
        // Error reaction
        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        
        await sock.sendMessage(chatId, {
            text: `❌ *AI Service Error*\n\n` +
                  `Error: ${error.message || 'Service temporarily unavailable'}\n\n` +
                  `*Troubleshooting:*\n` +
                  `1. Try a different AI model (.gemini instead of .gpt)\n` +
                  `2. Use .clear if conversation is stuck\n` +
                  `3. Try again in a few minutes\n` +
                  `4. Check your internet connection`,
            quoted: message 
        });
    }
}

// Helper function to download images
async function downloadImage(sock, imageMessage) {
    try {
        const stream = await sock.downloadMediaMessage(imageMessage);
        // Convert to base64 for APIs that support it
        const base64 = stream.toString('base64');
        return base64;
    } catch (error) {
        console.log('Image download failed:', error);
        return null;
    }
}

// Clean up old conversations periodically
setInterval(() => {
    const now = Date.now();
    for (const [convoId, data] of conversationMemory.entries()) {
        if (now - data.timestamp > MEMORY_TIMEOUT) {
            conversationMemory.delete(convoId);
        }
    }
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = aiCommand;