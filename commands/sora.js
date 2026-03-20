const fetch = require('node-fetch');
const FormData = require('form-data');
const { fileTypeFromBuffer } = require('file-type');

const API = 'https://www.nanobana.net/api';
const COOKIE = '__Host-authjs.csrf-token=30520470455c3e13eaed1f36a6d404badce7ea465230c2c98e0471bb72646a4e%7C3e869582574ac97763adf0b3d383e68275475d375f1926fd551aa712e4adbd24; __Secure-authjs.callback-url=https%3A%2F%2Fwww.nanobana.net%2F%23generator; g_state={"i_l":0,"i_ll":1769401024886,"i_b":"VKxqLQ5eJ0B2gQmnduZzPCwsZ1q418d0cjhhXWlbxTU","i_e":{"enable_itp_optimization":0}}; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiSWRmbEhwMk0teEF1V3l6Nkg1bHZrRHdOc0ZiM3BBOHVvMjNjaXhaZ1MxT1hHWUFNUUc0MGY0bW5XZnFtdWZyWnFYbHM2SFZILUZncDlvaUk5dTdIbHcifQ..lasLfR5B2_Rf2Q_F3K6fgw.Tro9GauoZdTk0Dtt_Dt6HJK5eG_OZoP66i6LKgtDzaj6v42BIhO-Hre144rB3wYfFQovDVKXyxAGG8WyP5FW_H3WTJP-it5Sm8xfmj7WWSbAzXGXPOcw-782yVRqLAK4cxuNNGVYCNJhOxLnKEAh_3bRBUHpkDmDfsnC8z5FmTtURhA32n-KiMW5zcPKKhY6haApLrOfJ3Y31NxjzVRDa-T-1vjTITsyFBsZW_WaFY8OHRz7giNl-rKbfm-OKEd_nvU0NqdnEUS_LBYN-5b7u5f1buYMdIt8M2g6YIaYwhdXIGZ-x9HpJz2API7NrhKN5tTwaN6UMPFq4ZSfEdYEWipfmUMacv5oGfW7AmaAWMoVvYs5tudzI00D_M0GE3A5F20fLFRMRgDOsI3cs5-e0TzGOTobv3D7UGau8XCrxX5exf5L6Q1C15A6xwtPpRJu1cOg1BlnOXf0gueF4sAAcg._Bl87onRhLiZFFuzC-e1_udKFzuUFVAfhW4FfmtUufE';

const HEADERS = {
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'origin': 'https://www.nanobana.net',
    'referer': 'https://www.nanobana.net/',
    'cookie': COOKIE
};

async function req(url, opts) {
    const res = await fetch(url, opts);
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
    try { 
        return JSON.parse(text); 
    } catch { 
        return text; 
    }
}

async function upload(buffer) {
    const { ext, mime } = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' };
    const form = new FormData();
    form.append('file', buffer, { filename: `image.${ext}`, contentType: mime });
    
    const data = await req(`${API}/upload/image`, {
        method: 'POST',
        headers: { ...HEADERS, ...form.getHeaders() },
        body: form
    });
    if (!data.url) throw new Error('Upload failed');
    return data.url;
}

async function generate(prompt, imageUrl) {
    const data = await req(`${API}/sora2/image-to-video/generate`, {
        method: 'POST',
        headers: { ...HEADERS, 'content-type': 'application/json' },
        body: JSON.stringify({
            prompt,
            image_urls: [imageUrl],
            aspect_ratio: 'portrait',
            n_frames: '10',
            remove_watermark: true
        })
    });
    if (!data.taskId) throw new Error('Failed to create task');
    return data.taskId;
}

async function waitTask(taskId, prompt) {
    for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const data = await req(`${API}/sora2/image-to-video/task/${taskId}?save=1&prompt=${encodeURIComponent(prompt)}`, {
            headers: HEADERS
        });
        if (data.status === 'completed') return data.saved?.[0]?.url;
        if (data.status === 'failed') throw new Error(data.provider_raw?.data?.failMsg || 'Generation failed');
    }
    throw new Error('Timeout - Generation took too long');
}

const soraCommand = async (sock, chatId, message, args) => {
    try {
        // Check if there's a quoted message
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage || !quotedMessage.imageMessage) {
            await sock.sendMessage(chatId, { 
                text: `❌ Please reply to an image with a prompt!\n\n*Example:* .sora make this image come to life\n\n*Available commands:*\n• .sora <prompt>\n• .imagetovideo <prompt>\n• .i2v <prompt>\n• .img2vid <prompt>`,
                ...global.channelInfo 
            }, { quoted: message });
            return;
        }

        // Get prompt from args
        const prompt = args.join(' ').trim();
        
        if (!prompt) {
            await sock.sendMessage(chatId, { 
                text: '❌ Please provide a prompt describing how you want the video to look!\n\n*Example:* .sora make the person wave and smile',
                ...global.channelInfo 
            }, { quoted: message });
            return;
        }

        // Download the quoted image
        const messageId = message.message.extendedTextMessage.contextInfo.stanzaId;
        const participant = message.message.extendedTextMessage.contextInfo.participant || message.key.participant;
        
        const media = await sock.downloadMediaMessage({
            key: {
                remoteJid: chatId,
                id: messageId,
                participant: participant
            },
            message: quotedMessage
        });

        if (!media) {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to download image!',
                ...global.channelInfo 
            }, { quoted: message });
            return;
        }

        // Send processing message
        await sock.sendMessage(chatId, { 
            text: '🎬 *SORA 2 AI: Image to Video*\n\n> _I am creating your video, please wait..._\n⏳ This may take 1-2 minutes',
            ...global.channelInfo 
        }, { quoted: message });

        // Process the image to video
        const imageUrl = await upload(media);
        const taskId = await generate(prompt, imageUrl);
        const videoUrl = await waitTask(taskId, prompt);

        // Send the video
        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            caption: `✅ *Video Created Successfully!*\n\n📝 *Prompt:* ${prompt}\n🎬 *Model:* SORA 2 Image-to-Video\n⚡ *Powered by:* cyberdark`,
            gifPlayback: false,
            ...global.channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('❌ SORA error:', error);
        
        let errorMessage = error.message || 'Unknown error occurred';
        
        if (errorMessage.includes('Upload failed')) {
            errorMessage = 'Failed to upload image. Please try again with a different image.';
        } else if (errorMessage.includes('HTTP 403')) {
            errorMessage = 'API authentication failed. The cookie might have expired.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
            errorMessage = 'Video generation timed out. Please try again later.';
        } else if (errorMessage.includes('Generation failed')) {
            errorMessage = 'AI failed to generate video. Try a different prompt or image.';
        }
        
        await sock.sendMessage(chatId, { 
            text: `❌ *SORA Error*\n\n📋 ${errorMessage}`,
            ...global.channelInfo 
        }, { quoted: message });
    }
};

module.exports = soraCommand;