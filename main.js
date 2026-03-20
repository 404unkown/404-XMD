const fs = require('fs');
const path = require('path');
const settings = require('./settings');

// Get prefix from settings
const PREFIX = settings.PREFIX || '.';
console.log(`💀 prefix: ${PREFIX}`);

// Temp storage setup (simplified)
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
  fs.readdir(customTemp, (err, files) => {
    if (err) return;
    for (const file of files) {
      const filePath = path.join(customTemp, file);
      fs.stat(filePath, (err, stats) => {
        if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    }
  });
  console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

require('./config.js');
const { isBanned } = require('./lib/isBanned');
const { fetchBuffer } = require('./lib/myfunc');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');
const { handleAutorecording, isAutorecordingEnabled } = require('./commands/autorecording');
const userSettings = require('./lib/userSettings');

// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const currencylistCommand = require('./commands/currencylist');
const exchangeCommand = require('./commands/exchange');
const forexCommand = require('./commands/forex');
const fxexchangeCommand = require('./commands/fxexchange');
const fxpairsCommand = require('./commands/fxpairs');
const fxstatusCommand = require('./commands/fxstatus');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const closeCommand = require('./commands/close');
const openCommand = require('./commands/open');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
// Add these imports at the top with your other command imports
const joinCommand = require('./commands/join');
const { modeCommand, isPublicModeForUser } = require('./commands/mode');
const newgcCommand = require('./commands/newgc');
const leaveCommand = require('./commands/leave');
const bibleCommand = require('./commands/bible');
const quranCommand = require('./commands/quran');
const obfuscateCommand = require('./commands/obfuscate');
const wikiCommand = require('./commands/wiki');
const addCommand = require('./commands/add');
const webcrawlCommand = require('./commands/webcrawl');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { Antilink } = require('./lib/antilink');
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = require('./commands/mention');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const creatorCommand = require('./commands/creator');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const removebgCommand = require('./commands/removebg');
const { igsCommand } = require('./commands/igs');
const { anticallCommand } = require('./commands/anticall');
const { dmblockerCommand, isDmBlockerEnabled, getDmBlockerMessage } = require('./commands/dmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');
const { autoreplyCommand, handleAutoreply } = require('./commands/autoreply');
const { vcfCommand } = require('./commands/vcf');
const imgscanCommand = require('./commands/imgscan');
const hackCommand = require('./commands/hack');
const audioEditor = require('./lib/audioeditor');
const toVideoCommand = require('./commands/tovideo');
const postStatusCommand = require('./commands/poststatus');
const blockCommand = require('./commands/block');
const unblockCommand = require('./commands/unblock');
const { seriesCommand } = require('./commands/series');
const { ringtoneCommand } = require('./commands/ringtone');
const { saveCommand } = require('./commands/save');
const { webzipCommand } = require('./commands/webzip');
const bothostingCommand = require('./commands/bothosting');
const newsletterCommand = require('./commands/newsletter'); 
const channelreactCommand = require('./commands/channelreact'); 
const uptimeCommand = require('./commands/uptime');
const tovideo2Command = require('./commands/tovideo2');
const tomp3Command = require('./commands/tomp3');
const topttCommand = require('./commands/toptt');
const getimageCommand = require('./commands/getimage');
const urlimageCommand = require('./commands/urlimage');
const checkcountryCommand = require('./commands/checkcountry');
const countryinfoCommand = require('./commands/countryinfo');
const { autostickerCommand, checkAutoSticker } = require('./commands/autosticker');
const defineCommand = require('./commands/define');
const gdriveCommand = require('./commands/gdrive');
const imgCommand = require('./commands/img');
const mediafireCommand = require('./commands/mediafire');
const ytpostCommand = require('./commands/ytpost');
const pindlCommand = require('./commands/pindl');
const autorecordingCommand = require('./commands/autorecording');
const emojiAnimations = require('./commands/emojianimations');
const fun2Commands = require('./commands/fun2');
const fancyCommand = require('./commands/fancy');
const animequoteCommand = require('./commands/animequote');
const quizCommand = require('./commands/quiz');
const squidgameCommand = require('./commands/squidgame');
const konamiCommand = require('./commands/konami');
const onlineCommand = require('./commands/online');
const groupRequestsCommand = require('./commands/grouprequests');
const pollCommand = require('./commands/poll');
const githubstalkCommand = require('./commands/githubstalk');
const gitcloneCommand = require('./commands/gitclone');
const convertCommand = require('./commands/convert');
const topdfCommand = require('./commands/topdf');
const wantedCommand = require('./commands/wanted');
const { autovoiceCommand, handleAutovoice } = require('./commands/autovoice');
const tiktokstalkCommand = require('./commands/tiktokstalk');
const robalCommand = require('./commands/robal');
const ttpCommand = require('./commands/ttp');
const smemeCommand = require('./commands/smeme');
const diceCommand = require('./commands/dice');
const antispamCommand = require('./commands/antispam');
const pairCommand = require('./commands/pair');

// Anti-spam system
let userSpamData = {};

async function handleAntiSpam(sock, chatId, message, senderId) {
  try {
    const currentTime = Date.now();
    
    if (!userSpamData[senderId]) {
      userSpamData[senderId] = {
        lastMessageTime: currentTime,
        messageCount: 1,
        warningCount: 0,
      };
    } else {
      const userData = userSpamData[senderId];
      const timeDifference = currentTime - userData.lastMessageTime;

      if (timeDifference <= 5000) {
        userData.messageCount += 1;

        if (userData.messageCount >= 8) {
          userData.warningCount += 1;
          
          try {
            await sock.sendMessage(chatId, { delete: message.key });
          } catch (e) {}
          
          if (userData.warningCount <= 2) {
            await sock.sendMessage(chatId, {
              text: `⚠️ @${senderId.split('@')[0]} Slow down! Too many messages.`,
              mentions: [senderId]
            });
          } else if (userData.warningCount >= 3) {
            try {
              await closeCommand(sock, chatId, senderId, message, 2);
            } catch (e) {}
            userData.warningCount = 0;
          }
          
          userData.messageCount = 0;
        }
      } else {
        userData.messageCount = 1;
      }
      
      userData.lastMessageTime = currentTime;
    }
  } catch (error) {
    console.error('Anti-spam error:', error);
  }
}

// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = settings.channelLink || "https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A";
global.ytch = settings.ytch || "404 unkown";

// Channel info for messages
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: settings.botName || '404 XMD',
            serverMessageId: -1
        }
    }
};

function startsWithPrefix(text) {
    return text.startsWith(PREFIX);
}

function removePrefix(text) {
    if (startsWithPrefix(text)) {
        return text.slice(PREFIX.length).trim();
    }
    return text;
}

// Audio effect handler
async function handleAudioEffect(sock, chatId, message, effect) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: `🔊 *Reply to an audio or video message*\nExample: Reply to audio with \`${PREFIX}deep\``,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const isAudio = !!quotedMsg.audioMessage;
        const isVideo = !!quotedMsg.videoMessage;
        
        if (!isAudio && !isVideo) {
            await sock.sendMessage(chatId, {
                text: "❌ *Invalid media type*\nPlease reply to an audio or video message.",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        let buffer;
        try {
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const mediaType = isAudio ? 'audio' : 'video';
            const media = isAudio ? quotedMsg.audioMessage : quotedMsg.videoMessage;
            
            const stream = await downloadContentFromMessage(media, mediaType);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            buffer = Buffer.concat(chunks);
            
            if (!buffer || buffer.length === 0) {
                throw new Error('Downloaded empty buffer');
            }
        } catch (error) {
            throw new Error('Failed to download media');
        }

        if (!audioEditor[effect]) {
            await sock.sendMessage(chatId, {
                text: `❌ *Unknown effect: ${effect}*`,
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        let processedAudio = await audioEditor[effect](buffer, isVideo ? 'mp4' : 'mp3');
        
        const sendOptions = {
            audio: processedAudio,
            ptt: true,
            mimetype: 'audio/ogg; codecs=opus'
        };
        
        if (isVideo) {
            sendOptions.mimetype = 'audio/mpeg';
            sendOptions.ptt = false;
        }
        
        await sock.sendMessage(chatId, sendOptions, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: `❌ Failed to process audio: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;
        
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        if (settings.AUTO_RECORDING === 'true') {
            await sock.sendPresenceUpdate('recording', message.key.remoteJid);
            setTimeout(async () => {
                try {
                    await sock.sendPresenceUpdate('paused', message.key.remoteJid);
                } catch (error) {}
            }, 2000);
        }

        await handleAutoread(sock, message);

        if (message.message) {
            storeMessage(sock, message);
        }

        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (settings.ANTI_SPAM !== 'false' && !message.key.fromMe && !senderIsOwnerOrSudo) {
            await handleAntiSpam(sock, chatId, message, senderId);
        }

        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            
            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, { 
                    text: `📢 *Join our Channel:*\n${global.channelLink}` 
                }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                await ownerCommand(sock, chatId);
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(chatId, { 
                    text: `🔗 *Support*\n\nhttps://chat.whatsapp.com/120363401269012709?mode=wwt` 
                }, { quoted: message });
                return;
            }
        }

        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';
        
        const originalMessage = rawText.trim();
        const userMessage = originalMessage.toLowerCase();
        
        const isQuizAnswer = /^[a-dA-D]$/.test(originalMessage);
        if (isQuizAnswer && !startsWithPrefix(originalMessage)) {
            const wasQuizAnswer = await quizCommand.checkAnswer(sock, chatId, senderId, originalMessage);
            if (wasQuizAnswer) return;
        }

        if (startsWithPrefix(userMessage)) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }
        
        const sessionOwnerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
let isPublic = isPublicModeForUser(sessionOwnerId);
        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;
        
        const commandWithoutPrefix = removePrefix(userMessage);
        if (isBanned(senderId) && !commandWithoutPrefix.startsWith('unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ You are banned from using the bot.',
                    ...channelInfo
                });
            }
            return;
        }

        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        if (isGroup) {
            if (userMessage) {
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }
            await Antilink(message, sock);
        }

        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                if (isDmBlockerEnabled(ownerId)) {
                    const blockMessage = getDmBlockerMessage(ownerId);
                    await sock.sendMessage(chatId, { text: blockMessage });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) {}
        }

        if (!startsWithPrefix(userMessage)) {
            await handleAutotypingForMessage(sock, chatId, userMessage);
            
            if (userMessage.trim()) await checkAutoSticker(sock, chatId, message, userMessage);
            
            if (!isGroup) {
                await handleAutoreply(sock, chatId, senderId, userMessage, message);
                await handleAutovoice(sock, chatId, senderId, userMessage, message);
            }

            if (isGroup) {
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);
                
                if (isPublic || isOwnerOrSudoCheck) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
            }
            return;
        }
        
        await handleAutorecording(sock, chatId, message);
        
        if (!isPublic && !isOwnerOrSudoCheck) {
            return;
        }

        const commandText = removePrefix(userMessage);
        
        const adminCommands = ['close', 'open', 'ban', 'unban', 'promote', 'demote', 'kick', 'tagall', 'tagnotadmin', 'hidetag', 'antilink', 'antitag', 'setgdesc', 'setgname', 'setgpp'];
        const isAdminCommand = adminCommands.some(cmd => commandText.startsWith(cmd));

        const ownerCommands = ['mode', 'autostatus', 'antidelete', 'cleartmp', 'setpp', 'clearsession', 'areact', 'autoreact', 'autotyping', 'autoread', 'dmblocker', 'hack', 'autosticker'];
        const isOwnerCommand = ownerCommands.some(cmd => commandText.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Please make the bot an admin to use admin commands.', ...channelInfo }, { quoted: message });
                return;
            }

            if (commandText.startsWith('close') || commandText === 'open' || 
                commandText.startsWith('ban') || commandText.startsWith('unban') || 
                commandText.startsWith('promote') || commandText.startsWith('demote')) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: 'Sorry, only group admins can use this command.',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
            }
        }

        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
                return;
            }
        }

        let commandExecuted = false;
        const commandParts = commandText.split(' ');
        const baseCommand = commandParts[0];
        const args = commandParts.slice(1);

        switch (true) {
            case baseCommand === 'creator':
                await creatorCommand(sock, chatId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'pair' || baseCommand === 'link' || baseCommand === 'code':
                await pairCommand(sock, chatId, message, args.join(' '));
                commandExecuted = true;
                break;
                
            case baseCommand === 'antispam':
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
                    return;
                }
                await antispamCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'dado' || baseCommand === 'dados' || baseCommand === 'dadu' || baseCommand === 'dice' || baseCommand === 'roll':
                await diceCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'smeme' || baseCommand === 'stickermeme' || baseCommand === 'memesticker':
                await smemeCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'ttp' || baseCommand === 'ttp6' || baseCommand === 'textsticker':
                await ttpCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'robal' || baseCommand === 'wm' || baseCommand === 'steal' || baseCommand === 'repackage':
                await robalCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tiktokstalk' || baseCommand === 'ttstalk':
                await tiktokstalkCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'wanted' || baseCommand === 'wantededit':
                await wantedCommand(sock, chatId, message, rawText);
                commandExecuted = true;
                break;
                
            case baseCommand === 'topdf' || baseCommand === 'pdf':
                await topdfCommand(sock, chatId, message, rawText);
                commandExecuted = true;
                break;
                
            case baseCommand === 'convert' || baseCommand === 'sticker2img' || baseCommand === 'stoimg' || baseCommand === 'stickertoimage' || baseCommand === 's2i':
                await convertCommand(sock, chatId, message, rawText);
                commandExecuted = true;
                break;
                
            case baseCommand === 'gitclone' || baseCommand.startsWith('git'):
                await gitcloneCommand(sock, chatId, message, rawText);
                commandExecuted = true;
                break;
                
            case baseCommand === 'githubstalk' || baseCommand === 'gstalk' || baseCommand === 'gitstalk' || baseCommand === 'gits':
                await githubstalkCommand(sock, chatId, message, rawText);
                commandExecuted = true;
                break;
                
            case baseCommand === 'poll':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: '❌ Poll command can only be used in groups!', ...channelInfo }, { quoted: message });
                    commandExecuted = true;
                    break;
                }
                const pollAdminStatus = await isAdmin(sock, chatId, senderId);
                if (!pollAdminStatus.isBotAdmin) {
                    await sock.sendMessage(chatId, { text: '❌ Bot needs to be admin to create polls!', ...channelInfo }, { quoted: message });
                    commandExecuted = true;
                    break;
                }
                if (!pollAdminStatus.isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, { text: '❌ Only admins can create polls!', ...channelInfo }, { quoted: message });
                    commandExecuted = true;
                    break;
                }
                await pollCommand(sock, chatId, message, rawText);
                commandExecuted = true;
                break;
                
            case baseCommand === 'requestlist' || baseCommand === 'joinrequests':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: "❌ This command only works in groups!", quoted: message });
                    commandExecuted = true;
                    break;
                }
                const adminStatus1 = await isAdmin(sock, chatId, senderId);
                await groupRequestsCommand.requestlist(sock, chatId, message, isGroup, adminStatus1.isSenderAdmin, adminStatus1.isBotAdmin);
                commandExecuted = true;
                break;
                
            case baseCommand === 'acceptall':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: "❌ This command only works in groups!", quoted: message });
                    commandExecuted = true;
                    break;
                }
                const adminStatus2 = await isAdmin(sock, chatId, senderId);
                await groupRequestsCommand.acceptall(sock, chatId, message, isGroup, adminStatus2.isSenderAdmin, adminStatus2.isBotAdmin);
                commandExecuted = true;
                break;
                
            case baseCommand === 'rejectall':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: "❌ This command only works in groups!", quoted: message });
                    commandExecuted = true;
                    break;
                }
                const adminStatus3 = await isAdmin(sock, chatId, senderId);
                await groupRequestsCommand.rejectall(sock, chatId, message, isGroup, adminStatus3.isSenderAdmin, adminStatus3.isBotAdmin);
                commandExecuted = true;
                break;
                
            case baseCommand === 'online' || baseCommand === 'whosonline' || baseCommand === 'onlinemembers':
                const adminStatus = await isAdmin(sock, chatId, senderId);
                await onlineCommand.online(sock, chatId, message, isGroup, senderId, adminStatus.isSenderAdmin, adminStatus.isBotAdmin);
                commandExecuted = true;
                break;
                
            case baseCommand === 'squidgame':
                await squidgameCommand.squidgame(sock, chatId, message, isGroup);
                commandExecuted = true;
                break;
                
            case baseCommand === 'konami':
                await konamiCommand.konami(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'quiz' || baseCommand === 'q':
                await quizCommand.startQuiz(sock, chatId, message, userMessage);
                commandExecuted = true;
                break;
                
            case baseCommand === 'animequote' || baseCommand === 'aquote' || baseCommand === 'aniquote' || baseCommand === 'animeq':
                await animequoteCommand.animequote(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'fancy' || baseCommand === 'font' || baseCommand === 'style': {
                const text = commandText.replace(baseCommand, '').trim();
                if (!text) {
                    await sock.sendMessage(chatId, { text: `❎ Please provide text to convert.\n\n*Example:* ${PREFIX}fancy Hello World`, quoted: message });
                    commandExecuted = true;
                    break;
                }
                await fancyCommand.fancy(sock, chatId, message, text.split(' '));
                commandExecuted = true;
                break;
            }
                
            case baseCommand === 'compatibility' || baseCommand === 'friend' || baseCommand === 'fcheck':
                await fun2Commands.compatibility(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'aura':
                await fun2Commands.aura(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === '8ball2':
                await fun2Commands.eightBall(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'compliment':
                await fun2Commands.compliment(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'lovetest':
                await fun2Commands.lovetest(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'emoji':
                const emojiText = commandText.slice(6).trim();
                await fun2Commands.emoji(sock, chatId, message, emojiText.split(' '));
                commandExecuted = true;
                break;
                
            case baseCommand === 'happy':
                await emojiAnimations.happy(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'heart':
                await emojiAnimations.heart(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'angry':
                await emojiAnimations.angry(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'sad':
                await emojiAnimations.sad(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'shy':
                await emojiAnimations.shy(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'moon':
                await emojiAnimations.moon(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'confused':
                await emojiAnimations.confused(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'hot':
                await emojiAnimations.hot(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'nikal':
                await emojiAnimations.nikal(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'autorecording' || baseCommand === 'autorecord' || baseCommand === 'autorec' || baseCommand === 'recording':
                await autorecordingCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'pindl' || baseCommand === 'pinterestdl' || baseCommand === 'pint' || baseCommand === 'pind' || baseCommand === 'pindownload':
                await pindlCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'ytpost' || baseCommand === 'ytcommunity' || baseCommand === 'ytc' || baseCommand === 'youtubecommunity':
                await ytpostCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'mediafire' || baseCommand === 'mfire' || baseCommand === 'mfdownload' || baseCommand === 'mf':
                await mediafireCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'img' || baseCommand === 'image' || baseCommand === 'pic' || baseCommand === 'searchimg' || baseCommand === 'googleimage':
                await imgCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'gdrive' || baseCommand === 'gdownloader' || baseCommand === 'gdrivedl' || baseCommand === 'gdown':
                await gdriveCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'define' || baseCommand === 'dictionary' || baseCommand === 'dict' || baseCommand === 'meaning' || baseCommand === 'def':
                await defineCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'autosticker':
                await autostickerCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'check':
                await checkcountryCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'country' || baseCommand === 'countryinfo':
                await countryinfoCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'getimage' || baseCommand === 'tophoto' || baseCommand === 'url2image' || baseCommand === 'urltoimage' || baseCommand === 'fetchimage':
                await getimageCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tovideo2':
                await tovideo2Command(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tomp3':
                await tomp3Command(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'toptt' || baseCommand === 'toaudio':
                await topttCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'uptime' || baseCommand === 'runtime' || baseCommand === 'up':
                await uptimeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'bothosting' || baseCommand === 'deploy' || baseCommand === 'hosting':
                await bothostingCommand(sock, chatId, message); 
                commandExecuted = true;
                break;
                
            case baseCommand === 'newsletter' || baseCommand === 'cjid' || baseCommand === 'channelinfo':
                await newsletterCommand(sock, chatId, message); 
                commandExecuted = true;
                break;
                
            case baseCommand === 'channelreact' || baseCommand === 'creact' || baseCommand === 'chr':
                await channelreactCommand(sock, chatId, message); 
                commandExecuted = true;
                break;
                
            case baseCommand === 'webzip' || baseCommand === 'sitezip' || baseCommand === 'web' || baseCommand === 'archive':
                await webzipCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'send' || baseCommand === 'save' || baseCommand === 'sendme':
                await saveCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'ringtone' || baseCommand === 'ring' || baseCommand === 'ringtones':
                await ringtoneCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'post' || baseCommand === 'status' || baseCommand === 'story' || baseCommand === 'repost' || baseCommand === 'reshare':
                await postStatusCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'block':
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
                    return;
                }
                await blockCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case baseCommand === 'unblock':
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
                    return;
                }
                await unblockCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'deep':
            case baseCommand === 'smooth':
            case baseCommand === 'fat':
            case baseCommand === 'tupai':
            case baseCommand === 'blown':
            case baseCommand === 'radio':
            case baseCommand === 'robot':
            case baseCommand === 'chipmunk':
            case baseCommand === 'nightcore':
            case baseCommand === 'earrape':
            case baseCommand === 'bass':
            case baseCommand === 'reverse':
            case baseCommand === 'slow':
            case baseCommand === 'fast':
            case baseCommand === 'baby':
            case baseCommand === 'demon':
                await handleAudioEffect(sock, chatId, message, baseCommand);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tovideo':
                await toVideoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'hack':
                await hackCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'autoreply':
                await autoreplyCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'autovoice':
                const enhancedMessage = {
                    ...message,
                    _isVoiceNote: message.message?.audioMessage || (message.message?.videoMessage && message.message.videoMessage.ptt),
                    _isReplyToVoiceNote: message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage,
                    _originalCommand: userMessage
                };
                await autovoiceCommand(sock, chatId, enhancedMessage);
                commandExecuted = true;
                break;
                
            case baseCommand === 'vcf':
                await vcfCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'imgscan' || baseCommand === 'scanimg' || baseCommand === 'imagescan' || baseCommand === 'analyzeimg':
                await imgscanCommand(sock, message);
                commandExecuted = true;
                break;
                    
            case baseCommand === 'simage': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    await simageCommand(sock, quotedMessage, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: `Please reply to a sticker with the ${PREFIX}simage command to convert it.`, ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }
            
            case baseCommand === 'kick':
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'close': {
                const closeArg = args[0];
                const closeDuration = closeArg !== undefined ? parseInt(closeArg, 10) : undefined;
                if (closeArg !== undefined && (isNaN(closeDuration) || closeDuration <= 0)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes or use .close with no number to close immediately.', ...channelInfo }, { quoted: message });
                } else {
                    await closeCommand(sock, chatId, senderId, message, closeDuration);
                }
                commandExecuted = true;
                break;
            }
                
            case baseCommand === 'open':
                await openCommand(sock, chatId, senderId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'ban':
                if (!isGroup) {
                    if (!message.key.fromMe && !senderIsSudo) {
                        await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .ban in private chat.' }, { quoted: message });
                        break;
                    }
                }
                await banCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'unban':
                if (!isGroup) {
                    if (!message.key.fromMe && !senderIsSudo) {
                        await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .unban in private chat.' }, { quoted: message });
                        break;
                    }
                }
                await unbanCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'help' || baseCommand === 'menu' || baseCommand === 'bot' || baseCommand === 'list':
                await helpCommand(sock, chatId, message, global.channelLink);
                commandExecuted = true;
                break;
                
            case baseCommand === 'sticker' || baseCommand === 's':
                await stickerCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'warnings':
                const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, mentionedJidListWarnings);
                commandExecuted = true;
                break;
                
            case baseCommand === 'warn':
                const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tts':
                const text = commandText.slice(4).trim();
                await ttsCommand(sock, chatId, text, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'delete' || baseCommand === 'del':
                await deleteCommand(sock, chatId, message, senderId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'attp':
                await attpCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case baseCommand === 'settings':
                await settingsCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            
                
            case baseCommand === 'anticall':
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: 'Only owner/sudo can use anticall.' }, { quoted: message });
                    break;
                }
                await anticallCommand(sock, chatId, message, args.join(' '));
                commandExecuted = true;
                break;
                
            case baseCommand === 'dmblocker':
                await dmblockerCommand(sock, chatId, message, args.join(' '));
                commandExecuted = true;
                break;
                
            case baseCommand === 'owner':
                await ownerCommand(sock, chatId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tagall':
                await tagAllCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tagnotadmin':
                await tagNotAdminCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'hidetag':
                const messageText = commandText.slice(8).trim();
                const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tag':
                const tagMessageText = commandText.slice(4).trim();
                const tagReplyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await tagCommand(sock, chatId, senderId, tagMessageText, tagReplyMessage, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'antilink':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { text: 'Please make the bot an admin first.', ...channelInfo }, { quoted: message });
                    return;
                }
                await handleAntilinkCommand(sock, chatId, commandText, senderId, isSenderAdmin, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'antitag':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { text: 'Please make the bot an admin first.', ...channelInfo }, { quoted: message });
                    return;
                }
                await handleAntitagCommand(sock, chatId, commandText, senderId, isSenderAdmin, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'meme':
                await memeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'joke':
                await jokeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'quote':
                await quoteCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'fact':
                await factCommand(sock, chatId, message, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'weather':
                const city = args.join(' ');
                if (city) {
                    await weatherCommand(sock, chatId, message, city);
                } else {
                    await sock.sendMessage(chatId, { text: `Please specify a city, e.g., ${PREFIX}weather London`, ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
                
            case baseCommand === 'news':
                await newsCommand(sock, chatId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'ttt' || baseCommand === 'tictactoe':
                const tttText = args.join(' ');
                await tictactoeCommand(sock, chatId, senderId, tttText);
                commandExecuted = true;
                break;
                
            case baseCommand === 'move':
                const position = parseInt(args[0]);
                if (isNaN(position)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid position number for Tic-Tac-Toe move.', ...channelInfo }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { text: 'Move command needs implementation', ...channelInfo });
                }
                commandExecuted = true;
                break;
// Add these cases where you have your other command cases

case baseCommand === 'join':
    await joinCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'newgc' || baseCommand === 'creategc' || baseCommand === 'creategroup':
    await newgcCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'leave' || baseCommand === 'leavegroup':
    await leaveCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'bible':
    await bibleCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'quran':
    await quranCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'obfuscate' || baseCommand === 'obf':
    await obfuscateCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'wiki' || baseCommand === 'wikipedia':
    await wikiCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'add':
    await addCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'webcrawl' || baseCommand === 'crawl':
    await webcrawlCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
                
            case baseCommand === 'topmembers':
                topMembers(sock, chatId, isGroup);
                commandExecuted = true;
                break;
                
            case baseCommand === 'hangman':
                startHangman(sock, chatId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'guess':
                const guessedLetter = args[0];
                if (guessedLetter) {
                    guessLetter(sock, chatId, guessedLetter);
                } else {
                    sock.sendMessage(chatId, { text: `Please guess a letter using ${PREFIX}guess <letter>`, ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
                
            case baseCommand === 'trivia':
                startTrivia(sock, chatId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'answer':
                const answer = args.join(' ');
                if (answer) {
                    answerTrivia(sock, chatId, answer);
                } else {
                    sock.sendMessage(chatId, { text: `Please provide an answer using ${PREFIX}answer <answer>`, ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
                
            case baseCommand === 'compliment':
                await complimentCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'insult':
                await insultCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === '8ball':
                const question = args.join(' ');
                await eightBallCommand(sock, chatId, question);
                commandExecuted = true;
                break;
                
            case baseCommand === 'lyrics':
                const songTitle = args.join(' ');
                await lyricsCommand(sock, chatId, songTitle, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'simp':
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await simpCommand(sock, chatId, quotedMsg, mentionedJid, senderId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'stupid' || baseCommand === 'itssostupid' || baseCommand === 'iss':
                const stupidQuotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const stupidMentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await stupidCommand(sock, chatId, stupidQuotedMsg, stupidMentionedJid, senderId, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'dare':
                await dareCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'truth':
                await truthCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'clear':
                if (isGroup) await clearCommand(sock, chatId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'promote':
                const mentionedJidListPromote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await promoteCommand(sock, chatId, mentionedJidListPromote, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'demote':
                const mentionedJidListDemote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await demoteCommand(sock, chatId, mentionedJidListDemote, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'ping':
                await pingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'alive':
                await aliveCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'mention':
                const mentionArgs = args.join(' ');
                const isOwner = message.key.fromMe || senderIsSudo;
                await mentionToggleCommand(sock, chatId, message, mentionArgs, isOwner);
                commandExecuted = true;
                break;
                
            case baseCommand === 'setmention':
                const isOwner2 = message.key.fromMe || senderIsSudo;
                await setMentionCommand(sock, chatId, message, isOwner2);
                commandExecuted = true;
                break;
                
            case baseCommand === 'blur':
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await blurCommand(sock, chatId, message, quotedMessage);
                commandExecuted = true;
                break;
                
            case baseCommand === 'welcome':
                if (isGroup) {
                    if (!isSenderAdmin) {
                        const adminStatus = await isAdmin(sock, chatId, senderId);
                        isSenderAdmin = adminStatus.isSenderAdmin;
                    }
                    if (isSenderAdmin || message.key.fromMe) {
                        await welcomeCommand(sock, chatId, message);
                    } else {
                        await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
                
            case baseCommand === 'goodbye':
                if (isGroup) {
                    if (!isSenderAdmin) {
                        const adminStatus = await isAdmin(sock, chatId, senderId);
                        isSenderAdmin = adminStatus.isSenderAdmin;
                    }
                    if (isSenderAdmin || message.key.fromMe) {
                        await goodbyeCommand(sock, chatId, message);
                    } else {
                        await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
                
            case baseCommand === 'git' || baseCommand === 'github' || baseCommand === 'sc' || baseCommand === 'script' || baseCommand === 'repo':
                await githubCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'antibadword':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                    return;
                }

                const adminStatusAB = await isAdmin(sock, chatId, senderId);
                isSenderAdmin = adminStatusAB.isSenderAdmin;
                isBotAdmin = adminStatusAB.isBotAdmin;

                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { text: '*Bot must be admin to use this feature*', ...channelInfo }, { quoted: message });
                    return;
                }

                await antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin);
                commandExecuted = true;
                break;
                
            case baseCommand === 'chatbot':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                    return;
                }

                const chatbotAdminStatus = await isAdmin(sock, chatId, senderId);
                if (!chatbotAdminStatus.isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, { text: '*Only admins or bot owner can use this command*', ...channelInfo }, { quoted: message });
                    return;
                }

                const match = commandText.slice(8).trim();
                await handleChatbotCommand(sock, chatId, message, match);
                commandExecuted = true;
                break;
                
            case baseCommand === 'take' || baseCommand === 'steal':
                await takeCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'flirt':
                await flirtCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'character':
                await characterCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'waste':
                await wastedCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'ship':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await shipCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'groupinfo' || baseCommand === 'infogp' || baseCommand === 'infogrupo':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await groupInfoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'resetlink' || baseCommand === 'revoke' || baseCommand === 'anularlink':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await resetlinkCommand(sock, chatId, senderId);
                commandExecuted = true;
                break;
                
            case baseCommand === 'staff' || baseCommand === 'admins' || baseCommand === 'listadmin':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await staffCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tourl' || baseCommand === 'url':
                await urlCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'emojimix' || baseCommand === 'emix':
                await emojimixCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tg' || baseCommand === 'stickertelegram' || baseCommand === 'tgsticker' || baseCommand === 'telesticker':
                await stickerTelegramCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case baseCommand === 'vv':
                await viewOnceCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'clearsession' || baseCommand === 'clearsesi':
                await clearSessionCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'autostatus':
                await autoStatusCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'metallic':
case baseCommand === 'ice':
case baseCommand === 'snow':
case baseCommand === 'impressive':
case baseCommand === 'matrix':
case baseCommand === 'light':
case baseCommand === 'neon':
case baseCommand === 'devil':
case baseCommand === 'purple':
case baseCommand === 'thunder':
case baseCommand === 'leaves':
case baseCommand === '1917':
case baseCommand === 'arena':
case baseCommand === 'hacker':
case baseCommand === 'sand':
case baseCommand === 'blackpink':
case baseCommand === 'glitch':
case baseCommand === 'fire':
case baseCommand === 'dragonball':
case baseCommand === 'naruto':
case baseCommand === 'boom':
case baseCommand === 'water':
case baseCommand === 'underwater':
case baseCommand === '4d':
case baseCommand === 'boken':
case baseCommand === 'starnight':
case baseCommand === 'gold':
case baseCommand === 'xmd':
case baseCommand === '3d':
case baseCommand === 'luxury':
case baseCommand === 'american':
case baseCommand === 'embroider':
case baseCommand === 'foggyglass':
case baseCommand === 'silver':
case baseCommand === 'wetglass':
    await textmakerCommand(sock, chatId, message, commandText, baseCommand);
    commandExecuted = true;
    break;
                
            case baseCommand === 'antidelete':
                const antideleteMatch = commandText.slice(11).trim();
                await handleAntideleteCommand(sock, chatId, message, antideleteMatch);
                commandExecuted = true;
                break;
                
            case baseCommand === 'surrender':
                await handleTicTacToeMove(sock, chatId, senderId, 'surrender');
                commandExecuted = true;
                break;
                
            case baseCommand === 'cleartmp':
                await clearTmpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'setpp':
                await setProfilePicture(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'setgdesc':
                const descText = args.join(' ');
                await setGroupDescription(sock, chatId, senderId, descText, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'setgname':
                const nameText = args.join(' ');
                await setGroupName(sock, chatId, senderId, nameText, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'setgpp':
                await setGroupPhoto(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'instagram' || baseCommand === 'insta' || baseCommand === 'ig':
                await instagramCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'igsc':
                await igsCommand(sock, chatId, message, true);
                commandExecuted = true;
                break;
                
            case baseCommand === 'igs':
                await igsCommand(sock, chatId, message, false);
                commandExecuted = true;
                break;
                
            case baseCommand === 'fb' || baseCommand === 'facebook':
                await facebookCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'music':
                await playCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'spotify':
                await spotifyCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'play' || baseCommand === 'mp3' || baseCommand === 'ytmp3' || baseCommand === 'song':
                await songCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'video' || baseCommand === 'ytmp4':
                await videoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'tiktok' || baseCommand === 'tt':
                await tiktokCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'gpt' || baseCommand === 'gemini':
                await aiCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'translate' || baseCommand === 'trt':
                const commandLength = baseCommand === 'translate' ? 10 : 4;
                await handleTranslateCommand(sock, chatId, message, commandText.slice(commandLength));
                commandExecuted = true;
                break;
                
            case baseCommand === 'ss' || baseCommand === 'ssweb' || baseCommand === 'screenshot':
                const ssCommandLength = baseCommand === 'screenshot' ? 11 : (baseCommand === 'ssweb' ? 6 : 3);
                await handleSsCommand(sock, chatId, message, commandText.slice(ssCommandLength).trim());
                commandExecuted = true;
                break;
                
            case baseCommand === 'areact' || baseCommand === 'autoreact' || baseCommand === 'autoreaction':
                await handleAreactCommand(sock, chatId, message, isOwnerOrSudoCheck);
                commandExecuted = true;
                break;
                
            case baseCommand === 'sudo':
                await sudoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'goodnight' || baseCommand === 'lovenight' || baseCommand === 'gn':
                await goodnightCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'shayari' || baseCommand === 'shayri':
                await shayariCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'roseday':
                await rosedayCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'imagine' || baseCommand === 'flux' || baseCommand === 'dalle':
                await imagineCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'jid':
                async function groupJidCommand(sock, chatId, message) {
                    const groupJid = message.key.remoteJid;
                    if (!groupJid.endsWith('@g.us')) {
                        return await sock.sendMessage(chatId, { text: "❌ This command can only be used in a group." });
                    }
                    await sock.sendMessage(chatId, { text: `✅ Group JID: ${groupJid}` }, { quoted: message });
                }
                await groupJidCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'autotyping':
                await autotypingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'autoread':
                await autoreadCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'heart':
                await handleHeart(sock, chatId, message);
                commandExecuted = true;
                break;
                
            case baseCommand === 'horny':
            case baseCommand === 'circle':
            case baseCommand === 'lgbt':
            case baseCommand === 'police':
            case baseCommand === 'simpcard':
            case baseCommand === 'tonikawa':
            case baseCommand === 'its-so-stupid':
            case baseCommand === 'namecard':
            case baseCommand === 'oogway':
            case baseCommand === 'oogway2':
            case baseCommand === 'tweet':
            case baseCommand === 'ytcomment':
            case baseCommand === 'comrade':
            case baseCommand === 'gay':
            case baseCommand === 'glass':
            case baseCommand === 'jail':
            case baseCommand === 'passed':
            case baseCommand === 'triggered':
                await miscCommand(sock, chatId, message, [baseCommand, ...args]);
                commandExecuted = true;
                break;
                
            case baseCommand === 'animu':
                await animeCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                
            case baseCommand === 'nom':
            case baseCommand === 'poke':
            case baseCommand === 'cry':
            case baseCommand === 'kiss':
            case baseCommand === 'pat':
            case baseCommand === 'hug':
            case baseCommand === 'wink':
            case baseCommand === 'facepalm':
            case baseCommand === 'face-palm':
            case baseCommand === 'animuquote':
            case baseCommand === 'loli': {
                let sub = baseCommand;
                if (sub === 'facepalm') sub = 'face-palm';
                if (sub === 'animuquote') sub = 'quote';
                await animeCommand(sock, chatId, message, [sub]);
                commandExecuted = true;
                break;
            }
                
            case baseCommand === 'indonesia':
            case baseCommand === 'japan':
            case baseCommand === 'korea':
            case baseCommand === 'hijab':
                await piesAlias(sock, chatId, message, baseCommand);
                commandExecuted = true;
                break;
                
            case baseCommand === 'removebg' || baseCommand === 'rmbg' || baseCommand === 'nobg':
                await removebgCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
                case baseCommand === 'currencylist' || baseCommand === 'rates':
    await currencylistCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'exchange' || baseCommand === 'convert':
    await exchangeCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'forex':
    await forexCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'fxexchange':
    await fxexchangeCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'fxpairs':
    await fxpairsCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    
case baseCommand === 'fxstatus':
    await fxstatusCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
    case baseCommand === 'mode':
    await modeCommand(sock, chatId, message, args, senderId, pushName, senderIsOwnerOrSudo);
    commandExecuted = true;
    break;
                
            case baseCommand === 'sora':
                await soraCommand(sock, chatId, message);
                commandExecuted = true;
                break;
                
            default:
                if (isGroup) {
                    if (userMessage) {
                        await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                    }
                    await handleTagDetection(sock, chatId, message, senderId);
                    await handleMentionDetection(sock, chatId, message);
                }
                commandExecuted = false;
                break;
        }

        // Show typing after command execution if enabled for this user
        if (commandExecuted !== false) {
            await showTypingAfterCommand(sock, chatId);
        }

        if (startsWithPrefix(userMessage)) {
            await addCommandReaction(sock, message);
        }
    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
        if (chatId) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to process command!',
                ...channelInfo
            });
        }
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;

        if (!id.endsWith('@g.us')) return;

        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {}

        if (action === 'promote') {
            if (!isPublic) return;
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }

        if (action === 'demote') {
            if (!isPublic) return;
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }

        if (action === 'add') {
            await handleJoinEvent(sock, id, participants);
        }

        if (action === 'remove') {
            await handleLeaveEvent(sock, id, participants);
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};