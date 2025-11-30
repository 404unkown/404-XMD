// commands/creator.js

const creator = {
    name: "NUCH",
    number: "+254769769295",
    bio: "Bot Developer & Programmer",
    
    social: {
        instagram: "https://instagram.com/manuwesonga",
        github: "https://github.com/404unkown",
        youtube: "https://youtube.com/404unkown"
    },
    
    skills: ["JavaScript", "Node.js", "Bot Development", "Web Development"],
    
    message: "Thanks for using my bot! 🚀"
};

async function creatorCommand(sock, chatId) {
    const creatorText = `
👑 *CREATOR INFORMATION*

🤵 *Name:* ${creator.name}
📱 *Contact:* ${creator.number}
📝 *Bio:* ${creator.bio}

🌐 *Social Media:*
📷 Instagram: ${creator.social.instagram}
💻 GitHub: ${creator.social.github}
🎥 YouTube: ${creator.social.youtube}

💡 *Skills:* ${creator.skills.join(", ")}

${creator.message}
    `.trim();

    await sock.sendMessage(chatId, { 
        text: creatorText,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '0029Vb5ytZEE50UbwV7xBv1k@newsletter',
                newsletterName: '404 XMD',
                serverMessageId: -1
            }
        }
    });
}

module.exports = creatorCommand;