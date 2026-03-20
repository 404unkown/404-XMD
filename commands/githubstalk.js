module.exports = async (sock, chatId, message, rawText) => {
    try {
        // Extract username from command
        const parts = rawText.trim().split(' ');
        const username = parts[1];
        
        if (!username) {
            await sock.sendMessage(chatId, {
                text: "❌ Please provide a GitHub username.\n\n*Example:* .githubstalk octocat",
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

        // Send processing reaction
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const apiUrl = `https://api.github.com/users/${username}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        let userInfo = `👤 *Username:* ${data.name || data.login}
🔗 *Github URL:* ${data.html_url}
📝 *Bio:* ${data.bio || 'Not available'}
🏙️ *Location:* ${data.location || 'Unknown'}
📊 *Public Repos:* ${data.public_repos}
👥 *Followers:* ${data.followers} | *Following:* ${data.following}
📅 *Created At:* ${new Date(data.created_at).toDateString()}
🔭 *Public Gists:* ${data.public_gists}
🏢 *Company:* ${data.company || 'Not specified'}
📧 *Email:* ${data.email || 'Not public'}
🔗 *Blog:* ${data.blog || 'Not available'}

🤖 *Powered by 404XMD*`;

        await sock.sendMessage(
            chatId,
            {
                image: { url: data.avatar_url },
                caption: userInfo
            },
            { quoted: message }
        );

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('GitHub stalk error:', error);
        
        let errorMsg = "❌ Failed to fetch GitHub profile.";
        if (error.response?.status === 404) {
            errorMsg = "❌ GitHub user not found!";
        } else if (error.response?.data?.message) {
            errorMsg = `❌ ${error.response.data.message}`;
        } else if (error.message) {
            errorMsg = `❌ ${error.message}`;
        }

        await sock.sendMessage(chatId, {
            text: errorMsg,
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

        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};