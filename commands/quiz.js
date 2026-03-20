const axios = require('axios');

// Store active quizzes by chat ID
const activeQuizzes = new Map();

// Shuffle an array in place
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

module.exports = {
    async startQuiz(sock, chatId, message, userMessage) {
        try {
            // Check if there's already an active quiz in this chat
            if (activeQuizzes.has(chatId)) {
                await sock.sendMessage(chatId, { 
                    text: "🎯 There's already an active quiz in this chat! Please answer the current question first.",
                    quoted: message 
                });
                return;
            }

            // Send processing reaction
            await sock.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            // Fetch a quiz question from the API
            const response = await axios.get('https://the-trivia-api.com/v2/questions?limit=1', {
                timeout: 10000
            });
            
            const questionData = response.data[0];

            if (!questionData) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Failed to fetch a quiz question. Please try again later.',
                    quoted: message 
                });
                await sock.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }

            const { question, correctAnswer, incorrectAnswers, category, difficulty } = questionData;
            const options = [...incorrectAnswers, correctAnswer];
            shuffleArray(options);

            // Find the index of correct answer after shuffling
            const correctIndex = options.findIndex(opt => opt === correctAnswer);
            const correctLetter = String.fromCharCode(65 + correctIndex);

            // Store quiz data
            activeQuizzes.set(chatId, {
                correctAnswer,
                correctLetter,
                options,
                questionText: question.text,
                startTime: Date.now(),
                userId: message.key.participant || message.key.remoteJid
            });

            // Send the question and options to the user
            const optionsText = options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('\n');
            const quizMessage = `🎯 *Quiz Time!* 🎯

📝 *Category:* ${category || 'General'}
⚡ *Difficulty:* ${difficulty || 'Medium'}
❓ *Question:* ${question.text}

${optionsText}

⏰ *You have 20 seconds to answer!*
📝 *Reply with the letter (A, B, C, or D) of your choice.*

> Powered by 𝟺𝟶𝟺 𝕏𝕄𝔻`;

            await sock.sendMessage(chatId, { 
                text: quizMessage,
                quoted: message 
            });

            // Set timeout to clear quiz after 20 seconds
            setTimeout(() => {
                if (activeQuizzes.has(chatId)) {
                    const quizData = activeQuizzes.get(chatId);
                    sock.sendMessage(chatId, { 
                        text: `⏰ *Time's up!*\n\n📝 *Question was:* ${quizData.questionText}\n✅ *Correct answer was:* ${quizData.correctLetter}. ${quizData.correctAnswer}`
                    });
                    activeQuizzes.delete(chatId);
                }
            }, 20000);

        } catch (error) {
            console.error('Error fetching quiz data:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to fetch quiz data. Please try again later.',
                quoted: message 
            });
            await sock.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },

    // Function to handle quiz answers
    async checkAnswer(sock, chatId, senderId, answer) {
        if (!activeQuizzes.has(chatId)) return false;

        const quizData = activeQuizzes.get(chatId);
        
        // Check if this user started the quiz
        if (quizData.userId !== senderId) {
            return false;
        }

        // Check if answer is valid (A, B, C, D)
        const normalizedAnswer = answer.trim().toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(normalizedAnswer)) {
            return false;
        }

        // Get the answer index
        const answerIndex = normalizedAnswer.charCodeAt(0) - 65;
        const userAnswer = quizData.options[answerIndex];
        const isCorrect = userAnswer === quizData.correctAnswer;

        // Clear the quiz
        activeQuizzes.delete(chatId);

        // Send result
        if (isCorrect) {
            await sock.sendMessage(chatId, { 
                text: `🎉 *Correct!* 🎉\n\n✅ *Your answer:* ${normalizedAnswer}. ${userAnswer}\n✅ *Correct answer:* ${quizData.correctLetter}. ${quizData.correctAnswer}\n\n🏆 Well done!`
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `❌ *Incorrect!* ❌\n\n❌ *Your answer:* ${normalizedAnswer}. ${userAnswer}\n✅ *Correct answer:* ${quizData.correctLetter}. ${quizData.correctAnswer}\n\nBetter luck next time!`
            });
        }

        return true;
    },

    // Alternative: Simple quiz without API (fallback)
    async simpleQuiz(sock, chatId, message) {
        const quizzes = [
            {
                question: "What is the largest planet in our solar system?",
                options: ["Earth", "Mars", "Jupiter", "Saturn"],
                correct: 2, // Jupiter
                category: "Science",
                difficulty: "Easy"
            },
            {
                question: "Which element has the chemical symbol 'Au'?",
                options: ["Silver", "Gold", "Iron", "Copper"],
                correct: 1, // Gold
                category: "Chemistry",
                difficulty: "Easy"
            },
            {
                question: "How many continents are there?",
                options: ["5", "6", "7", "8"],
                correct: 2, // 7
                category: "Geography",
                difficulty: "Easy"
            },
            {
                question: "What is the capital of Japan?",
                options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
                correct: 2, // Tokyo
                category: "Geography",
                difficulty: "Easy"
            },
            {
                question: "Who wrote 'Romeo and Juliet'?",
                options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
                correct: 1, // Shakespeare
                category: "Literature",
                difficulty: "Medium"
            }
        ];

        const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
        
        const optionsText = randomQuiz.options.map((option, index) => 
            `${String.fromCharCode(65 + index)}. ${option}`
        ).join('\n');
        
        const quizMessage = `🎯 *Quiz Time!* 🎯

📝 *Category:* ${randomQuiz.category}
⚡ *Difficulty:* ${randomQuiz.difficulty}
❓ *Question:* ${randomQuiz.question}

${optionsText}

⏰ *You have 20 seconds to answer!*
📝 *Reply with the letter (A, B, C, or D) of your choice.*

> Powered by 𝟺𝟶𝟺 𝕏𝕄𝔻`;

        await sock.sendMessage(chatId, { 
            text: quizMessage,
            quoted: message 
        });

        // Store quiz data
        activeQuizzes.set(chatId, {
            correctAnswer: randomQuiz.options[randomQuiz.correct],
            correctLetter: String.fromCharCode(65 + randomQuiz.correct),
            options: randomQuiz.options,
            questionText: randomQuiz.question,
            startTime: Date.now(),
            userId: message.key.participant || message.key.remoteJid
        });

        // Set timeout
        setTimeout(() => {
            if (activeQuizzes.has(chatId)) {
                const quizData = activeQuizzes.get(chatId);
                sock.sendMessage(chatId, { 
                    text: `⏰ *Time's up!*\n\n✅ *Correct answer was:* ${quizData.correctLetter}. ${quizData.correctAnswer}`
                });
                activeQuizzes.delete(chatId);
            }
        }, 20000);
    }
};