module.exports = async (conn, chatId, message) => {
    try {
        const more = String.fromCharCode(8206);
        const readMore = more.repeat(4001);

        const guideText = `
*STEPS ON HOW TO DEPLOY A WHATSAPP BOT*
First you need a GitHub account.
Create one using the link:
https://github.com/

Secondly create a discord account.
https://discord.com/login

Once your done creating and verifying the two account, move over to the next step.

*NEXT STEPS*
Next step is to fork the bot repository. Click the link
https://github.com/404unkown/404-XMD

Then download the zip file.

Now authorise your discord account then claim coins for 3days, each day u can claim 10 coins.

https://bot-hosting.net/?aff=1358062837397852211

*NOTE:* Some bot require larger server to process while. (25 coin)

When your done creating a server (25 coin) open the server.

Upload your bot code you have downloaded

Start server Enjoy 😉

*Watch:* tutorial soon
https://youtube.com/@404tech
        `.trim();

        await conn.sendMessage(chatId, {
            image: { url: 'https://files.catbox.moe/852x91.jpeg' },
            caption: guideText,
            contextInfo: {
                mentionedJid: [message.key.participant || message.key.remoteJid],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '🪀『 404 XMD 』🪀',
                    serverMessageId: 143
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in bothosting command:', error);
        await conn.sendMessage(chatId, {
            text: '⚠️ An error occurred while fetching the deployment guide.'
        }, { quoted: message });
    }
};