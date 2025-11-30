// 🧹 Fix for ENOSPC / temp overflow in hosted panels
const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
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

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');

// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
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
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');

// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = "https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A";
global.ytch = "404 unkown";

// Add this near the top of main.js with other global configurations
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: '404 XMD',
            serverMessageId: -1
        }
    }
};

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Store message for antidelete feature
        if (message.message) {
            storeMessage(sock, message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            const chatId = message.key.remoteJid;

            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, { 
                    text: '📢 *Join our Channel:*\nhttps://whatsapp.com/channel/120363401269012709' 
                }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                const ownerCommand = require('./commands/owner');
                await ownerCommand(sock, chatId);
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(chatId, { 
                    text: `🔗 *Support*\n\nhttps://chat.whatsapp.com/120363401269012709?mode=wwt` 
                }, { quoted: message });
                return;
            }
        }

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.buttonsResponseMessage?.selectedButtonId?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        // Preserve raw message for commands like .tag that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        // Only log command usage
        if (userMessage.startsWith('.')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }
        // Read bot mode once; don't early-return so moderation can still run in private mode
        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {
            console.error('Error checking access mode:', error);
            // default isPublic=true on error
        }
        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;
        // Check if user is banned (skip ban check for unban command)
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            // Only respond occasionally to avoid spam
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ You are banned from using the bot. Contact an admin to get unbanned.',
                    ...channelInfo
                });
            }
            return;
        }

        // First check if it's a game move
        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        /*  // Basic message response in private chat
          if (!isGroup && (userMessage === 'hi' || userMessage === 'hello' || userMessage === 'bot' || userMessage === 'hlo' || userMessage === 'hey' || userMessage === 'bro')) {
              await sock.sendMessage(chatId, {
                  text: 'Hi, How can I help you?\nYou can use .menu for more info and commands.',
                  ...channelInfo
              });
              return;
          } */

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        // Check for bad words and antilink FIRST, before ANY other processing
        // Always run moderation in groups, regardless of mode
        if (isGroup) {
            if (userMessage) {
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }
            // Antilink checks message text internally, so run it even if userMessage is empty
            await Antilink(message, sock);
        }

        // PM blocker: block non-owner DMs when enabled (do not ban)
        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    // Inform user, delay, then block without banning globally
                    await sock.sendMessage(chatId, { text: pmState.message || 'Private messages are blocked. Please contact the owner in groups only.' });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) { }
        }

        // Then check for command prefix
        if (!userMessage.startsWith('.')) {
            // Show typing indicator if autotyping is enabled
            await handleAutotypingForMessage(sock, chatId, userMessage);

            if (isGroup) {
                // Always run moderation features (antitag) regardless of mode
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);

                // Only run chatbot in public mode or for owner/sudo
                if (isPublic || isOwnerOrSudoCheck) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
            }
            return;
        }
        // In private mode, only owner/sudo can run commands
        if (!isPublic && !isOwnerOrSudoCheck) {
            return;
        }

        // List of admin commands
        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.setgdesc', '.setgname', '.setgpp'];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));

        // List of owner commands
        const ownerCommands = ['.mode', '.autostatus', '.antidelete', '.cleartmp', '.setpp', '.clearsession', '.areact', '.autoreact', '.autotyping', '.autoread', '.pmblocker'];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        // Check admin status only for admin commands in groups
        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Please make the bot an admin to use admin commands.', ...channelInfo }, { quoted: message });
                return;
            }

            if (
                userMessage.startsWith('.mute') ||
                userMessage === '.unmute' ||
                userMessage.startsWith('.ban') ||
                userMessage.startsWith('.unban') ||
                userMessage.startsWith('.promote') ||
                userMessage.startsWith('.demote')
            ) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: 'Sorry, only group admins can use this command.',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
            }
        }

        // Check owner status for owner commands
        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
                return;
            }
        }

        // Command handlers - Execute commands immediately without waiting for typing indicator
        // We'll show typing indicator after command execution if needed
        let commandExecuted = false;

        switch (true) {
            case userMessage === '.creator':
                await creatorCommand(sock, chatId);
                break;

            case userMessage === '.simage': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    await simageCommand(sock, quotedMessage, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please reply to a sticker with the .simage command to convert it.', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.kick'):
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                break;
            case userMessage.startsWith('.mute'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const muteArg = parts[1];
                    const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
                    if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                        await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes or use .mute with no number to mute immediately.', ...channelInfo }, { quoted: message });
                    } else {
                        await muteCommand(sock, chatId, senderId, message, muteDuration);
                    }
                }
                break;
            case userMessage === '.unmute':
                await unmuteCommand(sock, chatId, senderId);
                break;
            case userMessage.startsWith('.ban'):
                if (!isGroup) {
                    if (!message.key.fromMe && !senderIsSudo) {
                        await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .ban in private chat.' }, { quoted: message });
                        break;
                    }
                }
                await banCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.unban'):
                if (!isGroup) {
                    if (!message.key.fromMe && !senderIsSudo) {
                        await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .unban in private chat.' }, { quoted: message });
                        break;
                    }
                }
                await unbanCommand(sock, chatId, message);
                break;
            case userMessage === '.help' || userMessage === '.menu' || userMessage === '.commands':
                await helpCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.promote'):
                await promoteCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.demote'):
                await demoteCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.sticker'):
                await stickerCommand(sock, message, chatId);
                break;
            case userMessage.startsWith('.warn'):
                await warnCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.warnings'):
                await warningsCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.tts'):
                await ttsCommand(sock, message, chatId);
                break;
            case userMessage === '.tictactoe':
                await tictactoeCommand(sock, chatId, senderId);
                break;
            case userMessage === '.topmembers':
                await topMembers(sock, chatId);
                break;
            case userMessage === '.owner':
                await ownerCommand(sock, chatId);
                break;
            case userMessage.startsWith('.delete'):
                await deleteCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.antilink'):
                await handleAntilinkCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.antitag'):
                await handleAntitagCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.mention'):
                await mentionToggleCommand(sock, chatId, message);
                break;
            case userMessage === '.meme':
                await memeCommand(sock, chatId);
                break;
            case userMessage.startsWith('.tag'):
                await tagCommand(sock, chatId, message, rawText);
                break;
            case userMessage === '.tagnotadmin':
                await tagNotAdminCommand(sock, chatId, message);
                break;
            case userMessage === '.hidetag':
                await hideTagCommand(sock, chatId, message);
                break;
            case userMessage === '.joke':
                await jokeCommand(sock, chatId);
                break;
            case userMessage === '.quote':
                await quoteCommand(sock, chatId);
                break;
            case userMessage === '.fact':
                await factCommand(sock, chatId);
                break;
            case userMessage.startsWith('.weather'):
                await weatherCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.news'):
                await newsCommand(sock, chatId, userMessage);
                break;
            case userMessage === '.attp':
                await attpCommand(sock, chatId, userMessage);
                break;
            case userMessage === '.hangman':
                await startHangman(sock, chatId, senderId);
                break;
            case userMessage.startsWith('.guess'):
                await guessLetter(sock, chatId, senderId, userMessage.split(' ')[1]);
                break;
            case userMessage === '.trivia':
                await startTrivia(sock, chatId, senderId);
                break;
            case userMessage.startsWith('.answer'):
                await answerTrivia(sock, chatId, senderId, userMessage.split(' ')[1]);
                break;
            case userMessage.startsWith('.compliment'):
                await complimentCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.insult'):
                await insultCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.8ball'):
                await eightBallCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.lyrics'):
                await lyricsCommand(sock, chatId, userMessage);
                break;
            case userMessage === '.dare':
                await dareCommand(sock, chatId);
                break;
            case userMessage === '.truth':
                await truthCommand(sock, chatId);
                break;
            case userMessage.startsWith('.clear'):
                await clearCommand(sock, chatId, userMessage);
                break;
            case userMessage === '.ping':
                await pingCommand(sock, chatId);
                break;
            case userMessage === '.alive':
                await aliveCommand(sock, chatId);
                break;
            case userMessage.startsWith('.blur'):
                await blurCommand(sock, message, chatId);
                break;
            case userMessage.startsWith('.welcome'):
                await welcomeCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.goodbye'):
                await goodbyeCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.github'):
                await githubCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.antibadword'):
                await antibadwordCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.chatbot'):
                await handleChatbotCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.take'):
                await takeCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.flirt'):
                await flirtCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.character'):
                await characterCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.wasted'):
                await wastedCommand(sock, message, chatId);
                break;
            case userMessage.startsWith('.ship'):
                await shipCommand(sock, chatId, message);
                break;
            case userMessage === '.groupinfo':
                await groupInfoCommand(sock, chatId);
                break;
            case userMessage === '.resetlink':
                await resetlinkCommand(sock, chatId);
                break;
            case userMessage === '.staff':
                await staffCommand(sock, chatId);
                break;
            case userMessage.startsWith('.emojimix'):
                await emojimixCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.viewonce'):
                await viewOnceCommand(sock, message, chatId);
                break;
            case userMessage.startsWith('.clearsession'):
                await clearSessionCommand(sock, chatId);
                break;
            case userMessage.startsWith('.autostatus'):
                await autoStatusCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.simp'):
                await simpCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.stupid'):
                await stupidCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.stickertelegram'):
                await stickerTelegramCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.textmaker'):
                await textmakerCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.antidelete'):
                await handleAntideleteCommand(sock, chatId, message);
                break;
            case userMessage === '.cleartmp':
                await clearTmpCommand(sock, chatId);
                break;
            case userMessage.startsWith('.setpp'):
                await setProfilePicture(sock, message, chatId);
                break;
            case userMessage.startsWith('.setgdesc'):
                await setGroupDescription(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.setgname'):
                await setGroupName(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.setgpp'):
                await setGroupPhoto(sock, message, chatId);
                break;
            case userMessage.startsWith('.instagram'):
                await instagramCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.facebook'):
                await facebookCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.spotify'):
                await spotifyCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.play'):
                await playCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.tiktok'):
                await tiktokCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.song'):
                await songCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.ai'):
                await aiCommand(sock, chatId, userMessage, message);
                break;
            case userMessage.startsWith('.url'):
                await urlCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.translate'):
                await handleTranslateCommand(sock, chatId, userMessage, message);
                break;
            case userMessage.startsWith('.ss'):
                await handleSsCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.areact'):
                await handleAreactCommand(sock, chatId, message);
                break;
            case userMessage === '.goodnight':
                await goodnightCommand(sock, chatId);
                break;
            case userMessage.startsWith('.shayari'):
                await shayariCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.roseday'):
                await rosedayCommand(sock, chatId);
                break;
            case userMessage.startsWith('.imagine'):
                await imagineCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.video'):
                await videoCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.sudo'):
                await sudoCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.misc'):
                await miscCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.anime'):
                await animeCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.pies'):
                await piesCommand(sock, chatId, userMessage);
                break;
            case userMessage === '.stickercrop':
                await stickercropCommand(sock, message, chatId);
                break;
            case userMessage === '.update':
                await updateCommand(sock, chatId);
                break;
            case userMessage.startsWith('.removebg'):
                await removebgCommand(sock, message, chatId);
                break;
            case userMessage.startsWith('.remini'):
                await reminiCommand(sock, message, chatId);
                break;
            case userMessage.startsWith('.igs'):
                await igsCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.anticall'):
                await anticallCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.pmblocker'):
                await pmblockerCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.settings'):
                await settingsCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.sora'):
                await soraCommand(sock, chatId, userMessage);
                break;
            case userMessage.startsWith('.autotyping'):
                await autotypingCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.autoread'):
                await autoreadCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.tagall'):
                await tagAllCommand(sock, chatId, message);
                break;
            default:
                // If no command matched
                break;
        }

        // Show typing indicator after command execution if enabled
        if (commandExecuted && isAutotypingEnabled()) {
            await showTypingAfterCommand(sock, chatId);
        }

    } catch (error) {
        console.error('Error in handleMessages:', error);
    }
}

// Export the function
module.exports = { handleMessages };