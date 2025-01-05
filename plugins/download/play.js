const axios = require('axios'); // Import axios for making HTTP requests
const { ytsearch } = require('ruhend-scraper'); // Import ytsearch from 'ruhend-scraper'

exports.run = {
    usage: ['play'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, users, env, Func, Scraper }) => {
        try {
            // Check if a query is provided
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'song name'), m);

            // Send a reaction to indicate processing
            client.sendReact(m.chat, '🕒', m.key);

            // Search for the song using the 'ruhend-scraper' API
            const searchResults = await ytsearch(text);
            if (!searchResults || searchResults.length === 0) {
                return client.reply(m.chat, "No results found for your search.", m);
            }

            // Get the first search result
            const firstResult = searchResults[0];
            const youtubeUrl = firstResult.url; // Get the YouTube URL from the result

            // Make a request to the BetaBotz API to fetch the audio data
            const response = await axios.get(`https://api.betabotz.eu.org/api/download/yt?url=${youtubeUrl}&apikey=hehenowcopy`);
            if (!response.data.status) {
                return client.reply(m.chat, "Failed to fetch the audio. Please try again later.", m);
            }

            // Get the result from the API response
            const data = response.data.result;

            // Format the response message with audio details
            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `	◦  *Title* : ${data.title}\n`;
            caption += `	◦  *Author* : ${data.creator}\n`;
            caption += `	◦  *Duration* : ${Func.formatDuration(data.duration)}\n`;
            caption += `	◦  *Description* : ${data.description}\n\n`;
            caption += global.footer;

            // Send the search result message with the thumbnail
            client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: data.thumb
            }).then(async () => {
                // Send the audio file to the user
                client.sendFile(m.chat, data.mp3, `${data.title}.mp3`, '', m, {
                    document: true,
                    APIC: await Func.fetchBuffer(data.thumb)
                });
            });

        } catch (e) {
            console.error(e); // Log the error for debugging
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    restrict: true,
    cache: true,
    location: __filename
};
