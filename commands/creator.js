// commands/creator.js

const creator = {
    name: "NUCH",
    number: "+254769769295",
    bio: "Full Stack Developer & Bot Creator",
    location: "Kenya 🇰🇪",
    
    social: {
        instagram: "https://instagram.com/manuwesonga",
        github: "https://github.com/404unkown", 
        youtube: "https://youtube.com/404TECH"
    },

    skills: ["JavaScript", "Node.js", "React", "Python", "MongoDB", "API Development"],
    
    services: [
        "🤖 Custom WhatsApp Bots",
        "💻 Web Development", 
        "📱 Mobile Apps",
        "⚡ API Integration",
        "🔧 Automation Tools"
    ],

    message: "Let's build something amazing together! 🚀"
};

async function creatorCommand(sock, chatId) {
    try {
        console.log('🎯 Creator command activated for:', chatId);

        // Create a cool ASCII art banner
        const banner = `
╔══════════════════════════════════════╗
║             👑 CREATOR PROFILE       ║
╚══════════════════════════════════════╝
        `.trim();

        const creatorText = `
${banner}

🌟 *ABOUT ME*

┌──────────────────────────────────────┐
│ 🤵 *Name:* ${creator.name}
│ 📱 *Contact:* ${creator.number}  
│ 📍 *Location:* ${creator.location}
│ 💼 *Bio:* ${creator.bio}
└──────────────────────────────────────┘

🔗 *CONNECT WITH ME*

┌──────────────────────────────────────┐
│ 📷 *Instagram:* ${creator.social.instagram}
│ 💻 *GitHub:* ${creator.social.github}
│ 🎥 *YouTube:* ${creator.social.youtube}
└──────────────────────────────────────┘

💡 *TECH STACK*

┌──────────────────────────────────────┐
│ ${creator.skills.map(skill => `▸ ${skill}`).join('\n│ ')}
└──────────────────────────────────────┘

🛠️ *SERVICES OFFERED*

┌──────────────────────────────────────┐
│ ${creator.services.map(service => `▸ ${service}`).join('\n│ ')}
└──────────────────────────────────────┘

${creator.message}

💬 *Need a custom bot or website?*
📩 *DM me for collaborations & projects!*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim();

        console.log('🚀 Sending epic creator profile...');

        await sock.sendMessage(chatId, { 
            text: creatorText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        });

        console.log('✅ Epic creator profile delivered!');

    } catch (error) {
        console.error('💥 Creator command failed:', error);
    }
}

module.exports = creatorCommand;