const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message, channelLink) {
    const helpMessage = `
⸻ *404-𝗫𝗠𝗗* ⸻

┌─ *𝗼𝘄𝗻𝗲𝗿 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀* ─┐
 ✰ ↳ .mode
 ✰ ↳ .autostatus
 ✰ ↳ .antidelete
 ✰ ↳ .cleartmp
 ✰ ↳ .setpp
 ✰ ↳ .clearsession
 ✰ ↳ .areact
 ✰ ↳ .autoreact
 ✰ ↳ .autotyping
 ✰ ↳ .autoread
 ✰ ↳ .pmblocker
 ✰ ↳ .autosticker
 ✰ ↳ .autorecording
 ✰ ↳ .anticall
 ✰ ↳ .block
 ✰ ↳ .unblock
 ✰ ↳ .autoreply
 ✰ ↳ .sudo
 ✰ ↳ .update
 ✰ ↳ .settings
 ✰ ↳ .poststatus
 ✰ ↳ .channelreact
 ✰ ↳ .channelinfo
 ✰ ↳ .newsletter

┌─ *𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀* ─┐
 ✰ ↳ .add
 ✰ ↳ .kick
 ✰ ↳ .promote
 ✰ ↳ .demote
 ✰ ↳ .mute
 ✰ ↳ .unmute
 ✰ ↳ .ban
 ✰ ↳ .unban
 ✰ ↳ .tagall
 ✰ ↳ .tagnotadmin
 ✰ ↳ .hidetag
 ✰ ↳ .tag
 ✰ ↳ .antilink
 ✰ ↳ .antitag
 ✰ ↳ .antibadword
 ✰ ↳ .welcome
 ✰ ↳ .goodbye
 ✰ ↳ .setgdesc
 ✰ ↳ .setgname
 ✰ ↳ .setgpp
 ✰ ↳ .chatbot
 ✰ ↳ .clear
 ✰ ↳ .warn
 ✰ ↳ .warnings
 ✰ ↳ .resetlink
 ✰ ↳ .staff
 ✰ ↳ .groupinfo
 ✰ ↳ .lockgc
 ✰ ↳ .unlockgc
 ✰ ↳ .poll
 ✰ ↳ .requestlist
 ✰ ↳ .acceptall
 ✰ ↳ .rejectall
 ✰ ↳ .mention
 ✰ ↳ .setmention

┌─ *𝗮𝗶 & 𝗰𝗵𝗮𝘁𝗯𝗼𝘁𝘀* ─┐
 ✰ ↳ .gpt
 ✰ ↳ .gemini
 ✰ ↳ .ai
 ✰ ↳ .imagine
 ✰ ↳ .flux
 ✰ ↳ .dalle
 ✰ ↳ .sora
 ✰ ↳ .chatbot
 ✰ ↳ .tts
 ✰ ↳ .translate
 ✰ ↳ .trt
 ✰ ↳ .code
 ✰ ↳ .debug
 ✰ ↳ .explain
 ✰ ↳ .python
 ✰ ↳ .javascript
 ✰ ↳ .search
 ✰ ↳ .wiki

┌─ *𝗺𝗲𝗱𝗶𝗮 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱* ─┐
 ✰ ↳ .song
 ✰ ↳ .play
 ✰ ↳ .music
 ✰ ↳ .video
 ✰ ↳ .spotify
 ✰ ↳ .tiktok
 ✰ ↳ .tt
 ✰ ↳ .instagram
 ✰ ↳ .ig
 ✰ ↳ .igs
 ✰ ↳ .igsc
 ✰ ↳ .facebook
 ✰ ↳ .fb
 ✰ ↳ .ytmp4
 ✰ ↳ .ytmp3
 ✰ ↳ .ytpost
 ✰ ↳ .pindl
 ✰ ↳ .mediafire
 ✰ ↳ .gdrive
 ✰ ↳ .apk
 ✰ ↳ .movie
 ✰ ↳ .series
 ✰ ↳ .ringtone

┌─ *𝗺𝗲𝗱𝗶𝗮 𝗺𝗮𝗻𝗶𝗽𝘂𝗹𝗮𝘁𝗶𝗼𝗻* ─┐
 ✰ ↳ .sticker
 ✰ ↳ .simage
 ✰ ↳ .take
 ✰ ↳ .steal
 ✰ ↳ .emojimix
 ✰ ↳ .removebg
 ✰ ↳ .remini
 ✰ ↳ .blur
 ✰ ↳ .crop
 ✰ ↳ .attp
 ✰ ↳ .ss
 ✰ ↳ .tgsticker
 ✰ ↳ .vcf
 ✰ ↳ .imgscan
 ✰ ↳ .tovideo
 ✰ ↳ .tovideo2
 ✰ ↳ .tomp3
 ✰ ↳ .toptt
 ✰ ↳ .convert
 ✰ ↳ .tophoto
 ✰ ↳ .topdf

┌─ *𝗮𝘂𝗱𝗶𝗼 𝗲𝗳𝗳𝗲𝗰𝘁𝘀* ─┐
 ✰ ↳ .deep
 ✰ ↳ .smooth
 ✰ ↳ .fat
 ✰ ↳ .tupai
 ✰ ↳ .blown
 ✰ ↳ .radio
 ✰ ↳ .robot
 ✰ ↳ .chipmunk
 ✰ ↳ .nightcore
 ✰ ↳ .earrape
 ✰ ↳ .bass
 ✰ ↳ .reverse
 ✰ ↳ .slow
 ✰ ↳ .fast
 ✰ ↳ .baby
 ✰ ↳ .demon

┌─ *𝘁𝗲𝘅𝘁 𝗺𝗮𝗸𝗲𝗿* ─┐
 ✰ ↳ .metallic
 ✰ ↳ .ice
 ✰ ↳ .snow
 ✰ ↳ .impressive
 ✰ ↳ .matrix
 ✰ ↳ .light
 ✰ ↳ .neon
 ✰ ↳ .devil
 ✰ ↳ .purple
 ✰ ↳ .thunder
 ✰ ↳ .leaves
 ✰ ↳ .1917
 ✰ ↳ .arena
 ✰ ↳ .hacker
 ✰ ↳ .sand
 ✰ ↳ .blackpink
 ✰ ↳ .glitch
 ✰ ↳ .fire
 ✰ ↳ .fancy

┌─ *𝗴𝗮𝗺𝗲𝘀 & 𝗳𝘂𝗻* ─┐
 ✰ ↳ .tictactoe
 ✰ ↳ .ttt
 ✰ ↳ .hangman
 ✰ ↳ .guess
 ✰ ↳ .trivia
 ✰ ↳ .answer
 ✰ ↳ .truth
 ✰ ↳ .dare
 ✰ ↳ .8ball
 ✰ ↳ .8ball2
 ✰ ↳ .compliment
 ✰ ↳ .insult
 ✰ ↳ .flirt
 ✰ ↳ .shayari
 ✰ ↳ .character
 ✰ ↳ .wasted
 ✰ ↳ .ship
 ✰ ↳ .simp
 ✰ ↳ .stupid
 ✰ ↳ .goodnight
 ✰ ↳ .roseday
 ✰ ↳ .quiz
 ✰ ↳ .squidgame
 ✰ ↳ .konami
 ✰ ↳ .lovetest
 ✰ ↳ .aura
 ✰ ↳ .compatibility

┌─ *𝗲𝗺𝗼𝗷𝗶 𝗮𝗻𝗶𝗺𝗮𝘁𝗶𝗼𝗻𝘀* ─┐
 ✰ ↳ .happy
 ✰ ↳ .heart
 ✰ ↳ .angry
 ✰ ↳ .sad
 ✰ ↳ .shy
 ✰ ↳ .moon
 ✰ ↳ .confused
 ✰ ↳ .hot
 ✰ ↳ .nikal
 ✰ ↳ .emoji

┌─ *𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻* ─┐
 ✰ ↳ .ping
 ✰ ↳ .alive
 ✰ ↳ .owner
 ✰ ↳ .creator
 ✰ ↳ .vv
 ✰ ↳ .url
 ✰ ↳ .jid
 ✰ ↳ .quote
 ✰ ↳ .joke
 ✰ ↳ .fact
 ✰ ↳ .weather
 ✰ ↳ .news
 ✰ ↳ .lyrics
 ✰ ↳ .namecard
 ✰ ↳ .git
 ✰ ↳ .github
 ✰ ↳ .githubstalk
 ✰ ↳ .gitclone
 ✰ ↳ .script
 ✰ ↳ .define
 ✰ ↳ .img
 ✰ ↳ .check
 ✰ ↳ .countryinfo
 ✰ ↳ .online
 ✰ ↳ .uptime
 ✰ ↳ .animequote

┌─ *𝗮𝗻𝗶𝗺𝗲 & 𝗿𝗲𝗮𝗰𝘁𝗶𝗼𝗻𝘀* ─┐
 ✰ ↳ .nom
 ✰ ↳ .poke
 ✰ ↳ .cry
 ✰ ↳ .kiss
 ✰ ↳ .pat
 ✰ ↳ .hug
 ✰ ↳ .wink
 ✰ ↳ .facepalm
 ✰ ↳ .animu
 ✰ ↳ .animequote

┌─ *𝗽𝗶𝗲𝘀 (𝗶𝗺𝗮𝗴𝗲𝘀)* ─┐
 ✰ ↳ .pies
 ✰ ↳ .china
 ✰ ↳ .indonesia
 ✰ ↳ .japan
 ✰ ↳ .korea
 ✰ ↳ .hijab

┌─ *𝗺𝗶𝘀𝗰𝗲𝗹𝗹𝗮𝗻𝗲𝗼𝘂𝘀* ─┐
 ✰ ↳ .heart
 ✰ ↳ .horny
 ✰ ↳ .circle
 ✰ ↳ .lgbt
 ✰ ↳ .lolice
 ✰ ↳ .its-so-stupid
 ✰ ↳ .oogway
 ✰ ↳ .oogway2
 ✰ ↳ .tweet
 ✰ ↳ .ytcomment
 ✰ ↳ .comrade
 ✰ ↳ .gay
 ✰ ↳ .glass
 ✰ ↳ .jail
 ✰ ↳ .passed
 ✰ ↳ .triggered
 ✰ ↳ .simpcard
 ✰ ↳ .tonikawa
 ✰ ↳ .hack
 ✰ ↳ .football
 ✰ ↳ .save
 ✰ ↳ .webzip
 ✰ ↳ .bothosting
 ✰ ↳ .adult
 ✰ ↳ .wanted

┌─ *𝘁𝗲𝗺𝗽 𝗮𝗻𝗱 𝘁𝗼𝗼𝗹𝘀* ─┐
 ✰ ↳ .tempmail
 ✰ ↳ .checkmail
 ✰ ↳ .tempnum
 ✰ ↳ .templist
 ✰ ↳ .otpbox
 ✰ ↳ .webzip
 ✰ ↳ .urlimage
 ✰ ↳ .getimage
`;

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
            }, { quoted: message });
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