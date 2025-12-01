const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         🚀 *BOT COMMANDS* 🚀         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

╭───────────────────────────────╮
│        🤖 *BOT INFO*          │
├───────────────────────────────┤
│ • Name: ${settings.botName || '404-XMD'} 
│ • Version: ${settings.version || '3.0.0'}
│ • Owner: ${settings.botOwner || 'Nuch'}
│ • YouTube: ${global.ytch}
╰───────────────────────────────╯

╭───────────────────────────────╮
│        🌐 *GENERAL*           │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│🎯│ .help / .menu              │
│📊│ .ping                      │
│💓│ .alive                     │
│🔊│ .tts <text>                │
│👤│ .owner                     │
│😂│ .joke                      │
│📜│ .quote                     │
│ℹ️ │ .fact                     │
│🌤️ │ .weather <city>           │
│📰│ .news                      │
│🎨│ .attp <text>               │
│🎵│ .lyrics <song>             │
│🎱│ .8ball <question>          │
│👥│ .groupinfo                 │
│🛡️ │ .staff / .admins          │
│🔍│ .vv                        │
│🌐│ .trt <text> <lang>         │
│📸│ .ss <link>                 │
│🆔│ .jid                       │
│🔗│ .url                       │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        👮‍♂️ *ADMIN*            │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│🔨│ .ban @user                 │
│⬆️│ .promote @user             │
│⬇️│ .demote @user              │
│🔇│ .mute <minutes>            │
│🔊│ .unmute                    │
│🗑️ │ .delete / .del            │
│👢│ .kick @user                │
│⚠️ │ .warnings @user           │
│🚨│ .warn @user                │
│🔗│ .antilink                  │
│🚫│ .antibadword               │
│🧹│ .clear                     │
│🏷️ │ .tag <message>            │
│👥│ .tagall                    │
│👤│ .tagnotadmin               │
│👻│ .hidetag <message>         │
│🤖│ .chatbot                   │
│🔄│ .resetlink                 │
│🔖│ .antitag <on/off>          │
│👋│ .welcome <on/off>          │
│👋│ .goodbye <on/off>          │
│📝│ .setgdesc <description>    │
│🏷️ │ .setgname <new name>      │
│🖼️ │ .setgpp (reply to image)  │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🔒 *OWNER*             │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│🌐│ .mode <public/private>     │
│🧹│ .clearsession              │
│🚫│ .antidelete                │
│📁│ .cleartmp                  │
│🔄│ .update                    │
│⚙️ │ .settings                 │
│🖼️ │ .setpp <reply to image>   │
│😍│ .autoreact <on/off>        │
│📱│ .autostatus <on/off>       │
│📱│ .autostatus react <on/off> │
│⌨️ │ .autotyping <on/off>      │
│👁️│ .autoread <on/off>        │
│📞│ .anticall <on/off>         │
│🚫│ .pmblocker <on/off/status> │
│💬│ .pmblocker setmsg <text>   │
│📍│ .setmention <reply to msg> │
│🔖│ .mention <on/off>  
      .autoreply <on/off>  
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🎨 *MEDIA*             │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│🖼️ │ .blur <image>             │
│🎭│ .simage <sticker>          │
│🏷️ │ .sticker <image>          │
│🎨│ .removebg                  │
│✨│ .remini                    │
│✂️ │ .crop <image>              │
│📱│ .tgsticker <Link>          │
│😂│ .meme                      │
│📦│ .take <packname>           │
│🎭│ .emojimix <emj1>+<emj2>    │
│📥│ .igs <insta link>          │
│📥│ .igsc <insta link>         │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🖼️ *PIES*              │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│🌍│ .pies <country>            │
│🇨🇳│ .china                    │
│🇮🇩│ .indonesia                │
│🇯🇵│ .japan                    │
│🇰🇷│ .korea                    │
│🧕│ .hijab                     │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🎮 *GAMES*             │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│⭕│ .tictactoe @user           │
│🎯│ .hangman                   │
│🔤│ .guess <letter>            │
│❓│ .trivia                     │
│✅│ .answer <answer>           │
│💬│ .truth                     │
│🎲│ .dare                      │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🤖 *AI*                │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│💡│ .gpt <question>            │
│🔷│ .gemini <question>         │
│🎨│ .imagine <prompt>          │
│✨│ .flux <prompt>             │
│🎥│ .sora <prompt>             │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🎯 *FUN*               │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│💝│ .compliment @user          │
│😠│ .insult @user              │
│💘│ .flirt                     │
│📜│ .shayari                   │
│🌙│ .goodnight                 │
│🌹│ .roseday                   │
│👤│ .character @user           │
│💀│ .wasted @user              │
│💑│ .ship @user                │
│😍│ .simp @user                │
│🤪│ .stupid @user [text]       │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🔤 *TEXTMAKER*         │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│✨│ .metallic <text>           │
│❄️ │ .ice <text>                │
│🌨️ │ .snow <text>               │
│🔥│ .impressive <text>         │
│💚│ .matrix <text>             │
│💡│ .light <text>              │
│🌆│ .neon <text>               │
│😈│ .devil <text>              │
│💜│ .purple <text>             │
│⚡│ .thunder <text>            │
│🍃│ .leaves <text>             │
│🎞️ │ .1917 <text>              │
│🏟️ │ .arena <text>             │
│💻│ .hacker <text>             │
│🏖️ │ .sand <text>              │
│🩷│ .blackpink <text>          │
│🌀│ .glitch <text>             │
│🔥│ .fire <text>               │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        📥 *DOWNLOADER*        │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│🎵│ .play <song_name>          │
│🎵│ .song <song_name>          │
│🎵│ .spotify <query>           │
│📷│ .instagram <link>          │
│📘│ .facebook <link>           │
│🎵│ .tiktok <link>             │
│🎬│ .video <song name>         │
│📹│ .ytmp4 <Link>              │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🧩 *MISC*              │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│💖│ .heart                     │
│😏│ .horny                     │
│⭕│ .circle                    │
│🏳️‍🌈│ .lgbt                     │
│👮│ .lolice                    │
│🤦│ .its-so-stupid             │
│📇│ .namecard                  │
│🐢│ .oogway                    │
│🐦│ .tweet                     │
│💬│ .ytcomment                 │
│🇷🇺│ .comrade                   │
│🏳️‍🌈│ .gay                      │
│🔍│ .glass                     │
│🚔│ .jail                      │
│✅│ .passed                    │
│😠│ .triggered                 │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        🖼️ *ANIME*             │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│😋│ .nom                       │
│👉│ .poke                      │
│😢│ .cry                       │
│💋│ .kiss                      │
│🤗│ .pat                       │
│🫂│ .hug                       │
│😉│ .wink                      │
│🤦│ .facepalm                  │
└─┴─────────────────────────────┘

╭───────────────────────────────╮
│        💻 *GITHUB*            │
╰───────────────────────────────╯
┌─┬─────────────────────────────┐
│🐙│ .git     {💀}.creator      │
│🔷│ .github                    │
│📜│ .sc                        │
│📝│ .script                    │
│📂│ .repo                      │
└─┴─────────────────────────────┘

📢 *Join my channel for updates!*`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD by 404unkown',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;