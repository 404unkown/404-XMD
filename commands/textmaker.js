const mumaker = require('mumaker');

async function textmakerCommand(client, chatId, message, args, sender, pushName, isOwner, type) {
    try {
        const text = args.join(' ').trim();

        if (!text) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return await client.sendMessage(chatId, {
                text: `🎨 *${type.toUpperCase()} TEXT*\n\nExample: .${type} Hello`
            }, { quoted: message });
        }

        await client.sendMessage(chatId, { react: { text: '🎨', key: message.key } });

        const styles = {
            metallic: "https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html",
            ice: "https://en.ephoto360.com/ice-text-effect-online-101.html",
            snow: "https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html",
            impressive: "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html",
            matrix: "https://en.ephoto360.com/matrix-text-effect-154.html",
            light: "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
            neon: "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html",
            devil: "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html",
            purple: "https://en.ephoto360.com/purple-text-effect-online-100.html",
            thunder: "https://en.ephoto360.com/thunder-text-effect-online-97.html",
            leaves: "https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html",
            '1917': "https://en.ephoto360.com/1917-style-text-effect-523.html",
            arena: "https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html",
            hacker: "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html",
            sand: "https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html",
            blackpink: "https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html",
            glitch: "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html",
            fire: "https://en.ephoto360.com/flame-lettering-effect-372.html",
            dragonball: "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html",
            naruto: "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html",
            boom: "https://en.ephoto360.com/boom-text-comic-style-text-effect-675.html",
            water: "https://en.ephoto360.com/create-water-effect-text-online-295.html",
            underwater: "https://en.ephoto360.com/3d-underwater-text-effect-online-682.html",
            '4d': "https://en.ephoto360.com/create-glowing-text-effects-online-706.html",
            boken: "https://en.ephoto360.com/bokeh-text-effect-86.html",
            starnight: "https://en.ephoto360.com/stars-night-online-84.html",
            gold: "https://en.ephoto360.com/modern-gold-purple-175.html",
            xmd: "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
            '3d': "https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html",
            luxury: "https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html",
            american: "https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html",
            embroider: "https://en.ephoto360.com/embroider-159.html",
            foggyglass: "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html",
            silver: "https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html",
            wetglass: "https://en.ephoto360.com/write-text-on-wet-glass-online-589.html"
        };

        const url = styles[type];
        if (!url) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return await client.sendMessage(chatId, {
                text: `❌ Invalid style: ${type}\n\nAvailable: ${Object.keys(styles).join(', ')}`
            }, { quoted: message });
        }

        const result = await mumaker.ephoto(url, text);

        if (!result || !result.image) {
            throw new Error('Failed to generate image');
        }

        await client.sendMessage(chatId, {
            image: { url: result.image },
            caption: `🎨 *${type.toUpperCase()} EFFECT*\nText: ${text}\n\n> 404 XMD`
        }, { quoted: message });

        await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Textmaker error:', error);
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        await client.sendMessage(chatId, {
            text: `❌ Failed: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = textmakerCommand;