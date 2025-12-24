const fs = require('fs');
const path = require('path');

module.exports = async function autorecordingCommand(sock, chatId, message, args) {
    try {
        const sender = message.key.participant || message.key.remoteJid;
        const settings = require('../settings');
        
        // Check if user is owner/sudo
        const { isSudo } = require('../lib/index');
        const isOwnerOrSudo = require('../lib/isOwner');
        const senderIsOwnerOrSudo = await isOwnerOrSudo(sender, sock, chatId);
        
        if (!message.key.fromMe && !senderIsOwnerOrSudo) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner or sudo!',
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
            return;
        }

        if (!args || args.length === 0) {
            const status = settings.AUTO_RECORDING === 'true' ? '✅ Enabled' : '❌ Disabled';
            await sock.sendMessage(chatId, {
                text: `🔊 *Auto-Recording Control*\n\n` +
                      `📊 *Current Status:* ${status}\n\n` +
                      `📝 *Usage:*\n` +
                      `• .autorecording on - Enable auto-recording\n` +
                      `• .autorecording off - Disable auto-recording\n` +
                      `• .autorecording status - Check current status\n\n` +
                      `⚙️ *Feature:* Shows "recording..." for 2 seconds when bot receives messages\n` +
                      `⏱️ *Duration:* 2 seconds\n` +
                      `👑 *Owner Only:* Yes`,
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
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable' || action === 'true' || action === 'yes') {
            // Update settings object
            settings.AUTO_RECORDING = 'true';
            
            // Save to file
            const settingsContent = `const settings = ${JSON.stringify(settings, null, 2)};\n\nmodule.exports = settings;`;
            fs.writeFileSync(path.join(__dirname, '../settings.js'), settingsContent);
            
            await sock.sendMessage(chatId, {
                text: '✅ *Auto-Recording Enabled*\n\nBot will now show "recording..." for 2 seconds when receiving messages.',
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
        } 
        else if (action === 'off' || action === 'disable' || action === 'false' || action === 'no') {
            // Update settings object
            settings.AUTO_RECORDING = 'false';
            
            // Save to file
            const settingsContent = `const settings = ${JSON.stringify(settings, null, 2)};\n\nmodule.exports = settings;`;
            fs.writeFileSync(path.join(__dirname, '../settings.js'), settingsContent);
            
            await sock.sendMessage(chatId, {
                text: '❌ *Auto-Recording Disabled*\n\nBot will no longer show recording indicator.',
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
        }
        else if (action === 'status' || action === 'check' || action === 'info') {
            const status = settings.AUTO_RECORDING === 'true' ? '✅ Enabled' : '❌ Disabled';
            await sock.sendMessage(chatId, {
                text: `📊 *Auto-Recording Status*\n\n` +
                      `🔊 *Status:* ${status}\n` +
                      `⏱️ *Duration:* 2 seconds\n` +
                      `📱 *Applies to:* All messages\n` +
                      `🔄 *Requires restart:* No\n\n` +
                      `Bot ${settings.AUTO_RECORDING === 'true' ? 'will' : 'will NOT'} show recording indicator.`,
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
        }
        else if (action === 'test') {
            // Test the recording
            await sock.sendMessage(chatId, {
                text: '🔊 *Testing Auto-Recording*\n\nShowing "recording..." for 2 seconds...',
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
            
            await sock.sendPresenceUpdate('recording', chatId);
            setTimeout(async () => {
                await sock.sendPresenceUpdate('paused', chatId);
                await sock.sendMessage(chatId, {
                    text: '✅ Test complete! Recording indicator shown for 2 seconds.',
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
            }, 2000);
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ *Invalid Option*\n\n' +
                      'Available options:\n' +
                      '• `on` - Enable auto-recording\n' +
                      '• `off` - Disable auto-recording\n' +
                      '• `status` - Check current status\n' +
                      '• `test` - Test recording indicator',
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
        }

    } catch (error) {
        console.error('Auto-recording command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to update auto-recording settings. Please try again.',
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
    }
};