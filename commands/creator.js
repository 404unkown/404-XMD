// commands/creator.js
const moment = require('moment-timezone');

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

async function creatorCommand(sock, chatId, message) {
    try {
        console.log('🎯 Creator command activated for:', chatId);

        // Get Kenya time
        const kenyaTime = moment().tz('Africa/Nairobi');
        const time = kenyaTime.format('HH:mm A');
        const date = kenyaTime.format('DD/MM/YYYY');
        const day = kenyaTime.format('dddd');
        const timeEmoji = getTimeEmoji(kenyaTime.hour());

        // Get user info
        const senderId = message.key.participant || message.key.remoteJid;
        const user = await sock.onWhatsApp(senderId);
        const userName = user[0]?.name || user[0]?.pushname || 'User';
        
        // Create simple profile caption
        const creatorText = `
${timeEmoji} *TIME (KENYA):* ${time}
📅 ${date} | ${day}

⸻ 𝗖𝗥𝗘𝗔𝗧𝗢𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 ⸻

👤 *Name:* ${creator.name}
📍 *Location:* ${creator.location}
💼 *Bio:* ${creator.bio}

🔗 *Social Links:*
• Instagram: ${creator.social.instagram}
• GitHub: ${creator.social.github}
• YouTube: ${creator.social.youtube}

💻 *Skills:* ${creator.skills.join(' • ')}

🛠️ *Services Offered:*
${creator.services.map(service => `• ${service}`).join('\n')}

📞 *Contact:* ${creator.number}

💬 *Message:* ${creator.message}

✦─────────────────────────────✦
 ✰ Requested by: ${userName}
 ✰ Time: ${time} (KE)
✦─────────────────────────────✦
🐐 THE GOAT
`.trim();

        console.log('🚀 Sending creator profile...');

        // Send ONE message with image and caption
        await sock.sendMessage(chatId, {
            image: { 
                url: 'https://files.catbox.moe/hlh1f3.png'
            },
            caption: creatorText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: false,
                mentionedJid: [senderId],
                externalAdReply: {
                    title: "👑 BOT CREATOR",
                    body: "404-XMD System Architect",
                    mediaType: 1,
                    thumbnailUrl: 'https://files.catbox.moe/hlh1f3.png',
                    sourceUrl: creator.social.github,
                    renderLargerThumbnail: true
                }
            }
        });

        // Optional: Quick contact message
        const quickContact = `
📞 *Quick Contact Info:*
• WhatsApp: ${creator.number}
• GitHub: ${creator.social.github}
• Projects: .repo

💡 *Need help with bot?*
Use .help for commands or .ping to test bot speed
        `;

        await sock.sendMessage(chatId, { 
            text: quickContact
        });

        console.log('✅ Creator profile delivered!');

    } catch (error) {
        console.error('💥 Creator command failed:', error);
        
        // Simple fallback
        const fallbackMsg = `
🚨 *Error loading profile*
Here's the basic info:

👤 *Creator:* ${creator.name}
📍 *From:* Kenya 🇰🇪
📞 *Contact:* ${creator.number}
💻 *GitHub:* ${creator.social.github}

Use .help for bot commands
🐐 THE GOAT
`;
        
        await sock.sendMessage(chatId, { text: fallbackMsg });
    }
}

// Helper function to get time-based emoji
function getTimeEmoji(hour) {
    if (hour >= 5 && hour < 12) return '🌅'; // Morning
    if (hour >= 12 && hour < 17) return '☀️'; // Afternoon
    if (hour >= 17 && hour < 20) return '🌇'; // Evening
    if (hour >= 20 || hour < 5) return '🌙'; // Night
    return '🕐'; // Default
}

module.exports = creatorCommand;