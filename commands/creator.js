const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

const creator = {
    name: "NUCH",
    number: "+254769769295",
    bio: "Full Stack Developer & Bot Creator",
    from: "🇰🇪",
    
    social: {
        instagram: "https://instagram.com/_404_unkown",
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
        // Get Kenya time
        const kenyaTime = moment().tz('Africa/Nairobi');
        const time = kenyaTime.format('HH:mm A');
        const date = kenyaTime.format('DD/MM/YYYY');
        const day = kenyaTime.format('dddd');
        const timeEmoji = getTimeEmoji(kenyaTime.hour());

        // Create profile caption
        const creatorText = `
${timeEmoji} *TIME (KENYA):* ${time}
📅 ${date} | ${day}

⸻ *CREATOR PROFILE* ⸻

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
 ✰ Time: ${time} (KE)
✦─────────────────────────────✦
NUCHO
`.trim();

        // Try to use creator.png from assets folder
        const imagePath = path.join(__dirname, '../assets/creator.png');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: creatorText,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            });
        } else {
            console.error('Creator image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: creatorText,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in creator command:', error);
        await sock.sendMessage(chatId, { 
            text: `👤 *Creator:* ${creator.name}\n📍 *From:* Kenya 🇰🇪\n📞 *Contact:* ${creator.number}\n💻 *GitHub:* ${creator.social.github}\n🐐 THE GOAT`
        });
    }
}

// Helper function to get time-based emoji
function getTimeEmoji(hour) {
    if (hour >= 5 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 17) return '☀️';
    if (hour >= 17 && hour < 20) return '🌇';
    if (hour >= 20 || hour < 5) return '🌙';
    return '🕐';
}

module.exports = creatorCommand;