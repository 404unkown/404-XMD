const Replicate = require("replicate");
require('dotenv').config(); // Load environment variables from .env

async function imagineCommand(sock, chatId, message) {
    try {
        const prompt = message.message?.conversation?.trim() ||
                      message.message?.extendedTextMessage?.text?.trim() || '';

        const imagePrompt = prompt.replace(/^\.imagine\s*/i, '').trim();

        if (!imagePrompt) {
            await sock.sendMessage(chatId, {
                text: '🎨 *Image Generation*\n\nPlease provide a prompt for the image generation.\n\n*Example:* .imagine a beautiful sunset over mountains'
            }, { quoted: message });
            return;
        }

        const processingMsg = await sock.sendMessage(chatId, {
            text: `🎨 *Generating your image...*\n\nPrompt: "${imagePrompt}"\n\nThis usually takes 10-20 seconds.`
        }, { quoted: message });

        try {
            // Initialize the Replicate client with the token from environment
            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN
            });

            // Run the Stable Diffusion 3 model
            const output = await replicate.run(
                "stability-ai/stable-diffusion-3", 
                {
                    input: {
                        prompt: enhancePrompt(imagePrompt),
                        // Optional parameters
                        // width: 1024,
                        // height: 1024,
                    }
                }
            );

            const imageUrl = output[0];

            // Delete the processing message
            await sock.sendMessage(chatId, { delete: processingMsg.key });

            // Send the generated image
            await sock.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: `🎨 *AI Generated Image*\n\n📝 *Prompt:* ${imagePrompt}\n\n✨ *Powered by 404-XMD & Replicate*`
            }, { quoted: message });

        } catch (apiError) {
            console.error('Replicate API Error:', apiError);
            await sock.sendMessage(chatId, { delete: processingMsg.key });

            let errorMsg = '❌ *Failed to generate image.*';
            if (apiError.message?.includes('token') || apiError.status === 401) {
                errorMsg += '\n\n🔐 *Possible issue:* The API token may be invalid or missing. Please check your `.env` file.';
            } else if (apiError.message?.includes('billing')) {
                errorMsg += '\n\n💳 *Possible issue:* Your Replicate account may need billing credits.';
            } else {
                errorMsg += `\n\nError: ${apiError.message}`;
            }

            await sock.sendMessage(chatId, {
                text: errorMsg
            }, { quoted: message });
        }

    } catch (error) {
        console.error('General imagine command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ An unexpected error occurred in the command.'
        }, { quoted: message });
    }
}

// Enhance prompt quality
function enhancePrompt(prompt) {
    const qualityEnhancers = ['high quality', 'detailed', 'masterpiece', '4k'];
    return `${prompt}, ${qualityEnhancers.join(', ')}`;
}

module.exports = imagineCommand;