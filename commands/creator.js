// commands/creator.js

const creator = {
    name: "NUCH",
    number: "+254769769295",
    bio: "FULL STACK DEVELOPER & BOT ARCHITECT",
    location: "KENYA 🇰🇪",
    
    social: {
        instagram: "https://instagram.com/manuwesonga",
        github: "https://github.com/404unkown",
        youtube: "https://youtube.com/404unkown"
    },

    skills: ["JAVASCRIPT", "NODE.JS", "REACT", "PYTHON", "MONGODB", "API DEVELOPMENT"],
    
    services: [
        "CUSTOM WHATSAPP BOTS",
        "WEB DEVELOPMENT", 
        "MOBILE APPLICATIONS",
        "API INTEGRATION",
        "AUTOMATION TOOLS"
    ],

    message: "LET'S BUILD SOMETHING LEGENDARY TOGETHER! 🚀"
};

async function creatorCommand(sock, chatId) {
    try {
        console.log('🎯 CREATOR COMMAND ACTIVATED');

        const creatorText = `
█████████████████████████████████████████████████
█▄─▄▄▀█─▄▄─█▄─▀─▄█▄─▄▄─█▄─▄▄▀█▄─█─▄█▄─▄█▄─▀█▄─▄█
██─▄─▄█─██─██▀─▀███─▄▄▄██─▄─▄██▄─▄███─███─█▄▀─██
▀▄▄▀▄▄▀▄▄▄▄▀▄▄█▄▄▀▄▄▄▀▀▀▄▄▀▄▄▀▀▄▄▄▀▀▄▄▄▀▄▄▄▀▀▄▄▀

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓ ██████  ██████  ██   ██ ███████ ██████  ▓
▓██    ██ ██   ██ ██  ██  ██      ██   ██ ▓  
▓██    ██ ██████  █████   █████   ██████  ▓
▓██    ██ ██   ██ ██  ██  ██      ██   ██ ▓
▓ ██████  ██████  ██   ██ ███████ ██   ██ ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼
◼ 🔥 CREATOR IDENTITY 🔥                        ◼
◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼

◼ NAME: ${creator.name}
◼ CONTACT: ${creator.number}
◼ LOCATION: ${creator.location}
◼ BIO: ${creator.bio}

◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼
◼ 🌐 DIGITAL PRESENCE 🌐                       ◼
◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼

◼ INSTAGRAM: ${creator.social.instagram}
◼ GITHUB: ${creator.social.github}
◼ YOUTUBE: ${creator.social.youtube}

◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼
◼ ⚡ TECHNICAL MASTERY ⚡                       ◼
◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼

${creator.skills.map(skill => `◼ ${skill}`).join('\n')}

◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼
◼ 🛠️ PROFESSIONAL SERVICES 🛠️                  ◼
◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼

${creator.services.map(service => `◼ ${service}`).join('\n')}

◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼

${creator.message}

◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼
◼ 🚀 READY FOR NEXT-LEVEL COLLABORATION? 🚀     ◼
◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼
`.trim();

        console.log('🎯 SENDING BOLD CREATOR PROFILE');

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

        console.log('✅ BOLD PROFILE DELIVERED!');

    } catch (error) {
        console.error('💥 CREATOR COMMAND FAILED:', error);
    }
}

module.exports = creatorCommand;