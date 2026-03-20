const fetch = require("node-fetch");

module.exports = async (sock, chatId, message, rawText) => {
    try {
        // Extract the GitHub URL
        const parts = rawText.trim().split(' ');
        const gitUrl = parts[1];
        
        if (!gitUrl) {
            await sock.sendMessage(chatId, {
                text: "❌ Where is the GitHub link?\n\n*Example:*\n.gitclone https://github.com/username/repository",
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

        if (!/^(https:\/\/)?github\.com\/.+/.test(gitUrl)) {
            await sock.sendMessage(chatId, {
                text: "⚠️ Invalid GitHub link. Please provide a valid GitHub repository URL.",
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

        const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i;
        const match = gitUrl.match(regex);

        if (!match) {
            throw new Error("Invalid GitHub URL.");
        }

        const [, username, repo] = match;
        const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

        // Check if repository exists
        const response = await fetch(zipUrl, { method: "HEAD" });
        if (!response.ok) {
            throw new Error("Repository not found.");
        }

        const contentDisposition = response.headers.get("content-disposition");
        const fileName = contentDisposition ? contentDisposition.match(/filename=(.*)/)[1] : `${repo}.zip`;

        // Notify user of the download
        await sock.sendMessage(chatId, {
            text: `📥 *Downloading repository...*\n\n*Repository:* ${username}/${repo}\n*Filename:* ${fileName}\n\n🤖 *Powered by 404XMD*`,
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

        // Send the zip file
        await sock.sendMessage(chatId, {
            document: { url: zipUrl },
            fileName: fileName,
            mimetype: 'application/zip',
            caption: `📦 *GitHub Repository Downloaded*\n\n*Repository:* ${username}/${repo}\n*Filename:* ${fileName}\n\n🤖 *Powered by 404XMD*`,
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

        // Success reaction
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Git clone error:", error);
        
        let errorMsg = "❌ Failed to download the repository.";
        if (error.message.includes("not found")) {
            errorMsg = "❌ Repository not found or is private.";
        } else if (error.message.includes("Invalid")) {
            errorMsg = "❌ Invalid GitHub URL format.";
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