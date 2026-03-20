const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message, channelLink) {
    const helpMessage = `
     *404-𝗫𝗠𝗗*

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
 ✰ ↳ .dmblocker
 ✰ ↳ .autosticker
 ✰ ↳ .autorecording
 ✰ ↳ .autovoice
 ✰ ↳ .anticall
 ✰ ↳ .block
 ✰ ↳ .unblock
 ✰ ↳ .autoreply
 ✰ ↳ .sudo
 ✰ ↳ .settings
 ✰ ↳ .poststatus
 ✰ ↳ .channelreact
 ✰ ↳ .channelinfo
 ✰ ↳ .newsletter

┌─ *𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀* ─┐
 ✰ ↳ .kick
 ✰ ↳ .promote
 ✰ ↳ .demote
 ✰ ↳ .close
 ✰ ↳ .open
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
 ✰ ↳ .ringtone

┌─ *𝗺𝗲𝗱𝗶𝗮 𝗺𝗮𝗻𝗶𝗽𝘂𝗹𝗮𝘁𝗶𝗼𝗻* ─┐
 ✰ ↳ .sticker
 ✰ ↳ .s
 ✰ ↳ .simage
 ✰ ↳ .take
 ✰ ↳ .steal
 ✰ ↳ .emojimix
 ✰ ↳ .removebg
 ✰ ↳ .blur
 ✰ ↳ .attp
 ✰ ↳ .ttp
 ✰ ↳ .ss
 ✰ ↳ .tg
 ✰ ↳ .stickertelegram
 ✰ ↳ .vcf
 ✰ ↳ .imgscan
 ✰ ↳ .tovideo
 ✰ ↳ .tovideo2
 ✰ ↳ .tomp3
 ✰ ↳ .toptt
 ✰ ↳ .convert
 ✰ ↳ .getimage
 ✰ ↳ .urlimage
 ✰ ↳ .topdf
 ✰ ↳ .smeme

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
 ✰ ↳ .dragonball
 ✰ ↳ .naruto
 ✰ ↳ .boom
 ✰ ↳ .water
 ✰ ↳ .underwater
 ✰ ↳ .4d
 ✰ ↳ .boken
 ✰ ↳ .starnight
 ✰ ↳ .gold
 ✰ ↳ .xmd
 ✰ ↳ .3d
 ✰ ↳ .luxury
 ✰ ↳ .american
 ✰ ↳ .embroider
 ✰ ↳ .foggyglass
 ✰ ↳ .silver
 ✰ ↳ .wetglass
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
 ✰ ↳ .dice
 ✰ ↳ .dado

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
 ✰ ↳ .viewonce
 ✰ ↳ .url
 ✰ ↳ .tourl
 ✰ ↳ .jid
 ✰ ↳ .quote
 ✰ ↳ .joke
 ✰ ↳ .fact
 ✰ ↳ .weather
 ✰ ↳ .news
 ✰ ↳ .lyrics
 ✰ ↳ .git
 ✰ ↳ .github
 ✰ ↳ .githubstalk
 ✰ ↳ .gitclone
 ✰ ↳ .script
 ✰ ↳ .define
 ✰ ↳ .img
 ✰ ↳ .image
 ✰ ↳ .check
 ✰ ↳ .countryinfo
 ✰ ↳ .online
 ✰ ↳ .uptime
 ✰ ↳ .animequote
 ✰ ↳ .delete
 ✰ ↳ .del
 ✰ ↳ .topmembers
 ✰ ↳ .meme
 ✰ ↳ .tiktokstalk
 ✰ ↳ .ttstalk
 ✰ ↳ .checkcountry
 ✰ ↳ .wanted

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
 ✰ ↳ .indonesia
 ✰ ↳ .japan
 ✰ ↳ .korea
 ✰ ↳ .hijab

┌─ *𝗺𝗶𝘀𝗰𝗲𝗹𝗹𝗮𝗻𝗲𝗼𝘂𝘀* ─┐
 ✰ ↳ .heart
 ✰ ↳ .horny
 ✰ ↳ .circle
 ✰ ↳ .lgbt
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
 ✰ ↳ .save
 ✰ ↳ .webzip
 ✰ ↳ .bothosting
 ✰ ↳ .robal

┌─ *𝘁𝗲𝗺𝗽 𝘁𝗼𝗼𝗹𝘀* ─┐
 ✰ ↳ .tempmail
 ✰ ↳ .checkmail
 ✰ ↳ .tempnum
 ✰ ↳ .templist
 ✰ ↳ .otpbox
 _____________________
 
. IF YOU ARE WEAK FEAR ME
`;

    try {
        await sock.sendMessage(chatId, { 
            text: helpMessage,
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
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;