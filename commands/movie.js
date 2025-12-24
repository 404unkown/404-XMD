const axios = require('axios');

async function movieCommand(sock, chatId, message, args) {
    try {
        const movieName = args.join(' ').trim();
        const omdbApiKey = 'dbb5eca5'; // Your activated API key

        if (!movieName) {
            // ... (send usage instructions, keep your existing text)
            return;
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        // Step 1: Search for the movie
        const searchUrl = `http://www.omdbapi.com/?s=${encodeURIComponent(movieName)}&apikey=${omdbApiKey}`;
        const searchResponse = await axios.get(searchUrl);

        if (searchResponse.data.Response === 'False') {
            // ... (handle "movie not found", keep your existing text)
            return;
        }

        const firstMovie = searchResponse.data.Search[0];

        // Step 2: Get full details
        const detailUrl = `http://www.omdbapi.com/?i=${firstMovie.imdbID}&apikey=${omdbApiKey}&plot=full`;
        const detailResponse = await axios.get(detailUrl);
        const movie = detailResponse.data;

        // Step 3: Format and send the information
        const infoMessage = `🎬 *${movie.Title}* (${movie.Year})\n\n` +
                           `⭐ *IMDb Rating:* ${movie.imdbRating}/10\n` +
                           `⏱️ *Runtime:* ${movie.Runtime}\n` +
                           `🎭 *Genre:* ${movie.Genre}\n` +
                           `🎬 *Director:* ${movie.Director}\n\n` +
                           `📖 *Plot:*\n${movie.Plot}\n\n` +
                           `🔗 *IMDb Page:* https://www.imdb.com/title/${movie.imdbID}/\n` +
                           `✨ *Info via 404-XMD & OMDb API*`;

        // Send poster if available, otherwise send text
        if (movie.Poster && movie.Poster !== 'N/A') {
            try {
                await sock.sendMessage(chatId, {
                    image: { url: movie.Poster },
                    caption: infoMessage
                }, { quoted: message });
            } catch (imageError) {
                await sock.sendMessage(chatId, { text: infoMessage }, { quoted: message });
            }
        } else {
            await sock.sendMessage(chatId, { text: infoMessage }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Movie command error:', error);
        // ... (handle error, keep your existing method)
    }
}

module.exports = { movieCommand };