module.exports = {
    name: 'emoji-animations',
    category: 'fun',
    desc: 'Fun emoji animation commands',
    
    async happy(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '😂' });
            const emojiMessages = [
                "😃", "😄", "😁", "😊", "😎", "🥳",
                "😸", "😹", "🌞", "🌈", "😃", "😄",
                "😁", "😊", "😎", "🥳", "😸", "😹",
                "🌞", "🌈", "😃", "😄", "😁", "😊"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    },
    
    async heart(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '🖤' });
            const emojiMessages = [
                "💖", "💗", "💕", "🩷", "💛", "💚",
                "🩵", "💙", "💜", "🖤", "🩶", "🤍",
                "🤎", "❤️‍🔥", "💞", "💓", "💘", "💝",
                "♥️", "💟", "❤️‍🩹", "❤️"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    },
    
    async angry(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '👽' });
            const emojiMessages = [
                "😡", "😠", "🤬", "😤", "😾", "😡",
                "😠", "🤬", "😤", "😾"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    },
    
    async sad(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '😔' });
            const emojiMessages = [
                "🥺", "😟", "😕", "😖", "😫", "🙁",
                "😩", "😥", "😓", "😪", "😢", "😔",
                "😞", "😭", "💔", "😭", "😿"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    },
    
    async shy(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '🧐' });
            const emojiMessages = [
                "😳", "😊", "😶", "🙈", "🙊",
                "😳", "😊", "😶", "🙈", "🙊"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    },
    
    async moon(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '🌝' });
            const emojiMessages = [
                "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
                "🌕", "🌖", "🌗", "🌘", "🌑", "🌒",
                "🌓", "🌔", "🌕", "🌖", "🌗", "🌘",
                "🌑", "🌒", "🌓", "🌔", "🌕", "🌖",
                "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
                "🌕", "🌖", "🌝🌚"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    },
    
    async confused(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '🤔' });
            const emojiMessages = [
                "😕", "😟", "😵", "🤔", "😖", 
                "😲", "😦", "🤷", "🤷‍♂️", "🤷‍♀️"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    },
    
    async hot(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '💋' });
            const emojiMessages = [
                "🥵", "❤️", "💋", "😫", "🤤", 
                "😋", "🥵", "🥶", "🙊", "😻", 
                "🙈", "💋", "🫂", "🫀", "👅", 
                "👄", "💋"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    },
    
    async nikal(sock, chatId, message) {
        try {
            const loadingMessage = await sock.sendMessage(chatId, { text: '404-XMD🗿' });
            
            const asciiMessages = [
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀⠀⠀⠀     ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀  ⠀    ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Nikal   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇
  ⠙⢿⣯⠄⠀⠀⠀__⠀   ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀⠀⠀⠀  ⠀  ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀       ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Lavde   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇
  ⠙⢿⣯⠄⠀⠀|__|⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀⠀      ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸   Pehli   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀     ⣿  ⢹⠀           ⡇
  ⠙⢿⣯⠄⠀⠀(P)⠀⠀     ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀   ⠀     ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Fursat  ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀        ⣿  ⢹⠀          ⡇
  ⠙⢿⣯⠄⠀⠀⠀__ ⠀  ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀⠀⠀⠀      ⢳⡀⠀⡏⠀⠀    ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀ ⠀      ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Meeee   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀       ⣿  ⢹⠀          ⡇
  ⠙⢿⣯⠄⠀⠀|__| ⠀    ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀⠀⠀   ⠀  ⠀⢳⡀⠀⡏⠀⠀       ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀  ⠀       ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲   ⣿  ⣸   Nikal   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀       ⣿  ⢹⠀           ⡇
  ⠙⢿⣯⠄⠀⠀lodu⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀   ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀  ⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀`
            ];

            for (const asciiMessage of asciiMessages) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: asciiMessage,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                quoted: message 
            });
        }
    }
};