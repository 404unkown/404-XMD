module.exports = {
    async konami(sock, chatId, message) {
        try {
            const senderId = message.key.participant || message.key.remoteJid;
            const senderName = senderId.split("@")[0];
            
            // Extended list of clubs and international teams with their emojis
            const teams = [
                "Real Madrid 🇪🇸",
                "FC Barcelone 🇪🇸",
                "Manchester United 🇬🇧",
                "Liverpool FC 🇬🇧",
                "Bayern Munich 🇩🇪",
                "Juventus 🇮🇹",
                "Paris Saint-Germain 🇫🇷",
                "Arsenal FC 🇬🇧",
                "AC Milan 🇮🇹",
                "Inter Milan 🇮🇹",
                "Chelsea FC 🇬🇧",
                "Borussia Dortmund 🇩🇪",
                "Cameroun 🇨🇲",
                "Côte D'Ivoire 🇨🇮",
                "Tottenham Hotspur 🇬🇧",
                "Sénégal 🇸🇳",
                "RDC 🇨🇩",
                "Congo 🇨🇬",
                "Ajax Amsterdam 🇳🇱",
                "FC Porto 🇵🇹",
                "SL Benfica 🇵🇹",
                "Olympique Lyonnais 🇫🇷",
                "Olympique de Marseille 🇫🇷",
                "AS Monaco 🇫🇷",
                "Sporting CP 🇵🇹",
                "Everton FC 🇬🇧",
                "West Ham United 🇬🇧",
                "Atletico Madrid 🇪🇸",
                "AS Roma 🇮🇹",
                "Fiorentina 🇮🇹",
                "Napoli 🇮🇹",
                "Celtic FC 🇬🇧",
                "Rangers FC 🇬🇧",
                "Feyenoord 🇳🇱",
                "PSV Eindhoven 🇳🇱",
                "Brazil 🇧🇷",
                "Germany 🇩🇪",
                "Argentina 🇦🇷",
                "France 🇫🇷",
                "Spain 🇪🇸",
                "Italy 🇮🇹",
                "England 🏴",
                "Portugal 🇵🇹",
                "Netherlands 🇳🇱",
                "Belgium 🇧🇪",
                "Mexico 🇲🇽",
                "Uruguay 🇺🇾",
                "USA 🇺🇸"
            ];

            // Random selection of two different teams
            const team1 = teams[Math.floor(Math.random() * teams.length)];
            let team2 = teams[Math.floor(Math.random() * teams.length)];
            while (team2 === team1) {
                team2 = teams[Math.floor(Math.random() * teams.length)];
            }

            // Match announcement
            const announcement = `⚽ *Match Versus*\n\n${team1} 🆚 ${team2}\n\n@${senderName}, Choose the winner! You have 30 seconds to think!`;
            
            await sock.sendMessage(chatId, {
                text: announcement,
                mentions: [senderId],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363401269012709@newsletter",
                        newsletterName: "404 XMD",
                        serverMessageId: 143
                    }
                }
            }, { quoted: message });

            // Wait 30 seconds
            await new Promise(resolve => setTimeout(resolve, 30000));

            // Random choice of winner between the two teams
            const chosenTeam = Math.random() < 0.5 ? team1 : team2;

            // Final message announcing the winner
            const resultMessage = `🏆 *Match Results*\n\nThe winner is...: ${chosenTeam}🥳\n\n> Here are the results!😎 @${senderName} !`;
            
            await sock.sendMessage(chatId, {
                text: resultMessage,
                mentions: [senderId]
            });

        } catch (error) {
            console.error("Error in konami command:", error);
            await sock.sendMessage(chatId, { 
                text: "❌ An error occurred while executing the konami command.",
                quoted: message 
            });
        }
    }
};