const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    // Color codes for different sections
    const colors = {
        primary: '🟣',
        info: '🔵',
        admin: '🔴',
        owner: '🟠',
        media: '🟢',
        games: '🟡',
        ai: '🟣',
        fun: '🟢',
        download: '🔵',
        misc: '🟡',
        anime: '🔴'
    };

    // Create a cool ASCII header
    const header = `
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   ██████╗  ██████╗ ██████╗     ██╗  ██╗███╗   ███╗  ║
║   ██╔══██╗██╔═══██╗██╔══██╗    ██║  ██║████╗ ████║  ║
║   ██████╔╝██║   ██║██████╔╝    ██║  ██║██╔████╔██║  ║
║   ██╔═══╝ ██║   ██║██╔══██╗    ██║  ██║██║╚██╔╝██║  ║
║   ██║     ╚██████╔╝██║  ██║    ╚█████╔╝██║ ╚═╝ ██║  ║
║   ╚═╝      ╚═════╝ ╚═╝  ╚═╝     ╚════╝ ╚═╝     ╚═╝  ║
║                                                      ║
║              ⚡ *404-XMD COMMAND CENTER* ⚡           ║
║                                                      ║
╚══════════════════════════════════════════════════════╝`.trim();

    // Bot info section with cool design
    const botInfo = `
${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
${colors.primary}                 🤖 *BOT INFO* 🤖
${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*

    📛 *Name*: ${settings.botName || '404-XMD'}
    🏷️ *Version*: ${settings.version || '2.0.0'}
    👑 *Owner*: ${settings.botOwner || 'Nuch'}
    📺 *YouTube*: ${global.ytch || 'Not set'}
    🌐 *Mode*: ${settings.mode || 'Public'}
    
${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*`.trim();

    // Function to create command sections with consistent styling
    const createSection = (title, color, commands) => {
        return `
${color} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
${color}                ${title}
${color} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*

${commands}
${color} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*`.trim();
    };

    // General Commands
    const generalCommands = `
🎯  .help / .menu     - Show this menu
📊  .ping            - Check bot status
💓  .alive           - Check if bot is alive
🔊  .tts <text>      - Text to speech
👤  .owner           - Show owner info
😂  .joke            - Get a random joke
📜  .quote           - Inspirational quote
ℹ️   .fact            - Random fact
🌤️  .weather <city>  - Weather forecast
📰  .news            - Latest news
🎨  .attp <text>     - Animated text to sticker
🎵  .lyrics <song>   - Song lyrics
🎱  .8ball <q>       - Magic 8 ball
👥  .groupinfo       - Group information
🛡️  .staff           - Group admins
🔍  .vv              - View once image
🌐  .trt <text> <lang> - Translate text
📸  .ss <link>       - Website screenshot
🆔  .jid             - Get JID info
🔗  .url <link>      - URL shortener`.trim();

    // Admin Commands
    const adminCommands = `
🔨  .ban @user       - Ban user from group
⬆️  .promote @user   - Make user admin
⬇️  .demote @user    - Remove admin
🔇  .mute <time>     - Mute user
🔊  .unmute          - Unmute user
🗑️  .delete / .del   - Delete message
👢  .kick @user      - Kick user
⚠️  .warnings @user  - Check warnings
🚨  .warn @user      - Warn user
🔗  .antilink        - Toggle anti-link
🚫  .antibadword <on/off> - Bad word filter
📋  .antibadword list - Bad words list
📊  .antibadword status - Filter status
🧹  .clear           - Clear chat
🏷️  .tag <msg>       - Tag specific message
👥  .tagall          - Tag all members
👤  .tagnotadmin     - Tag non-admins
👻  .hidetag <msg>   - Hidden tag
🤖  .chatbot         - Toggle chatbot
🔄  .resetlink       - Reset group link
🔖  .antitag <on/off> - Anti tag
👋  .welcome <on/off> - Welcome message
👋  .goodbye <on/off> - Goodbye message
📝  .setgdesc <desc> - Set group description
🏷️  .setgname <name> - Set group name
🖼️  .setgpp <image>  - Set group profile pic
📇  .vcf             - Export contacts`.trim();

    // Owner Commands
    const ownerCommands = `
🌐  .mode <public/private> - Change mode
🧹  .clearsession    - Clear session
🚫  .antidelete      - Anti delete
📁  .cleartmp        - Clear temp files
🔄  .update          - Update bot
⚙️  .settings        - Bot settings
🖼️  .setpp <image>   - Set bot profile
😍  .autoreact <on/off> - Auto reaction
📱  .autostatus <on/off> - Auto status
⌨️  .autotyping <on/off> - Auto typing
👁️ .autoread <on/off> - Auto read
📞  .anticall <on/off> - Anti call
🚫  .pmblocker <on/off/status> - PM blocker
💬  .pmblocker setmsg <text> - Set PM message
📍  .setmention <msg> - Set mention
🔖  .mention <on/off> - Mention toggle
💬  .autoreply <on/off> - Auto reply
💬  .autoreply on <msg> - Set auto reply`.trim();

    // Media Commands
    const mediaCommands = `
🖼️  .blur <image>    - Blur image
🎭  .simage <sticker> - Sticker to image
🏷️  .sticker <image> - Image to sticker
🎨  .removebg        - Remove background
✨  .remini          - Enhance image quality
✂️  .crop <image>    - Crop image
📱  .tgsticker <link> - Telegram sticker
😂  .meme            - Random meme
📦  .take <packname> - Take sticker
🎭  .emojimix <emj1>+<emj2> - Mix emojis
📥  .igs <insta>     - Download IG post
📥  .igsc <insta>    - Download IG story`.trim();

    // Downloader Commands
    const downloadCommands = `
🎵  .play <song>     - Play music
🎵  .song <song>     - Download song
🎵  .spotify <query> - Spotify track
📷  .instagram <link> - IG downloader
📘  .facebook <link> - FB downloader
🎵  .tiktok <link>   - TikTok downloader
🎬  .video <song>    - Download video
📹  .ytmp4 <link>    - YouTube to MP4`.trim();

    // AI Commands
    const aiCommands = `
💡  .gpt <question>  - ChatGPT
🔷  .gemini <question> - Google Gemini
🎨  .imagine <prompt> - AI Image generation
✨  .flux <prompt>   - Flux AI
🎥  .sora <prompt>   - Sora AI video`.trim();

    // Games Commands
    const gamesCommands = `
⭕  .tictactoe @user - Tic Tac Toe
🎯  .hangman         - Hangman game
🔤  .guess <letter>  - Guess the word
❓  .trivia          - Trivia game
✅  .answer <ans>    - Answer trivia
💬  .truth           - Truth game
🎲  .dare            - Dare game`.trim();

    // Fun Commands
    const funCommands = `
💝  .compliment @user - Compliment
😠  .insult @user    - Insult
💘  .flirt          - Flirt message
📜  .shayari        - Romantic shayari
🌙  .goodnight      - Goodnight message
🌹  .roseday        - Rose day message
👤  .character @user - Character analysis
💀  .wasted @user   - Wasted effect
💑  .ship @user     - Ship users
😍  .simp @user     - Simp rating
🤪  .stupid @user [text] - Stupid card`.trim();

    // Anime Commands
    const animeCommands = `
😋  .nom            - Anime eating
👉  .poke           - Anime poke
😢  .cry            - Anime crying
💋  .kiss           - Anime kiss
🤗  .pat            - Anime headpat
🫂  .hug            - Anime hug
😉  .wink           - Anime wink
🤦  .facepalm       - Anime facepalm`.trim();

    // Textmaker Commands
    const textmakerCommands = `
✨  .metallic <text> - Metallic text
❄️  .ice <text>      - Ice text
🌨️  .snow <text>     - Snow text
🔥  .impressive <text> - Impressive text
💚  .matrix <text>   - Matrix text
💡  .light <text>    - Light text
🌆  .neon <text>     - Neon text
😈  .devil <text>    - Devil text
💜  .purple <text>   - Purple text
⚡  .thunder <text>  - Thunder text
🍃  .leaves <text>   - Leaves text
🎞️  .1917 <text>     - 1917 style text
🏟️  .arena <text>    - Arena text
💻  .hacker <text>   - Hacker text
🏖️  .sand <text>     - Sand text
🩷  .blackpink <text> - Blackpink text
🌀  .glitch <text>   - Glitch text
🔥  .fire <text>     - Fire text`.trim();

    // New Features
    const newFeatures = `
${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
${colors.primary}              🆕 *NEW FEATURES* 🆕
${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*

🤖 *CHATBOT*: Advanced AI conversations
🎭 *EMOJIMIX*: Create custom emoji combinations
📱 *SOCIAL DOWNLOADER*: Support for multiple platforms
🎮 *GAMES*: Interactive multiplayer games
🖼️ *IMAGE TOOLS*: Professional editing tools
🔐 *SECURITY*: Enhanced group protection
🎵 *MUSIC*: High-quality audio streaming
✨ *TEXT EFFECTS*: 20+ text styling options

${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*`;

    // Footer
    const footer = `
${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
${colors.primary}                 📢 *INFO* 📢
${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*

🔹 *Prefix*: . (dot)
🔹 *Total Commands*: 150+
🔹 *Bot Status*: 🟢 Online
🔹 *Response Time*: < 1s
🔹 *Uptime*: 24/7

📢 *Join for updates!*
${global.channelLink || 'https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A'}

💬 *Support*: ${settings.botOwner || 'Contact owner'}

${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
${colors.primary}        ⚡ *POWERED BY 404-XMD* ⚡
${colors.primary} *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*`.trim();

    // Build the complete message
    const helpMessage = `
${header}

${botInfo}

${createSection('🌐 GENERAL COMMANDS', colors.info, generalCommands)}

${createSection('👮 ADMIN COMMANDS', colors.admin, adminCommands)}

${createSection('👑 OWNER COMMANDS', colors.owner, ownerCommands)}

${createSection('🖼️ MEDIA COMMANDS', colors.media, mediaCommands)}

${createSection('🎮 GAMES COMMANDS', colors.games, gamesCommands)}

${createSection('🤖 AI COMMANDS', colors.ai, aiCommands)}

${createSection('🎯 FUN COMMANDS', colors.fun, funCommands)}

${createSection('📥 DOWNLOADER COMMANDS', colors.download, downloadCommands)}

${createSection('😺 ANIME COMMANDS', colors.anime, animeCommands)}

${createSection('🔤 TEXTMAKER COMMANDS', colors.misc, textmakerCommands)}

${newFeatures}

${footer}`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        title: '⚡ 404-XMD COMMAND CENTER ⚡',
                        body: `Version ${settings.version || '2.0.0'} • ${settings.botOwner || 'Nuch'}`,
                        thumbnail: imageBuffer,
                        sourceUrl: global.channelLink || 'https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: message });
        } else {
            // If no image, send with cool text formatting
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        title: '⚡ 404-XMD COMMAND CENTER ⚡',
                        body: `Total Commands: 150+ • Version: ${settings.version || '2.0.0'}`,
                        sourceUrl: global.channelLink || 'https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A',
                        mediaType: 1
                    }
                }
            });
        }
        
        // Send a quick follow-up message with usage tips
        const tipsMessage = `
💡 *QUICK TIPS*
━━━━━━━━━━━━━━━━━━━━
• Use *.help <category>* for specific help
• Example: *.help games* or *.help media*
• Commands are case-insensitive
• Most commands work in groups & private
• Bot must be admin for group features
• Report issues to owner: *${settings.botOwner || 'Nuch'}*

🎯 *POPULAR COMMANDS*
• *.ping* - Check bot status
• *.play <song>* - Play music
• *.gpt <question>* - Ask AI
• *.sticker <image>* - Make sticker
• *.meme* - Random meme

⚡ *Enjoy using 404-XMD!*`;
        
        setTimeout(async () => {
            await sock.sendMessage(chatId, { text: tipsMessage });
        }, 1000);
        
    } catch (error) {
        console.error('Error in help command:', error);
        
        // Fallback simple help
        const simpleHelp = `
🤖 *404-XMD HELP MENU*

📍 *Basic Commands:*
.help - Show this menu
.ping - Check bot status
.owner - Owner info

📍 *Media Commands:*
.sticker - Make sticker
.play <song> - Play music
.video <song> - Download video

📍 *AI Commands:*
.gpt <question> - Ask ChatGPT
.imagine <prompt> - Generate image

📍 *Group Commands:*
.tagall - Mention all
.groupinfo - Group info
.antilink - Link protection

📢 *Channel:* ${global.channelLink || 'Not set'}`;
        
        await sock.sendMessage(chatId, { text: simpleHelp });
    }
}

module.exports = helpCommand;