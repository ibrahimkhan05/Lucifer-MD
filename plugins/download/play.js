const { ytsearch } = require('ruhend-scraper'); // Import ytsearch from 'ruhend-scraper'
const { ytmp3 } = require('ruhend-scraper'); // Import ytmp3 for audio extraction

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

            // Search for the song using ytsearch from ruhend-scraper
            const { video } = await ytsearch(text);

            // Check if search results are found
            if (!video || video.length === 0) {
                return client.reply(m.chat, "No results found for the song.", m);
            }

            // Get the first video result
            const firstResult = video[0];

            // Use the ytmp3 function to get the audio file of the first result
            const data = await ytmp3(firstResult.url);

            // Check if data is returned
            if (!data) {
                return client.reply(m.chat, "Error retrieving audio data.", m);
            }

            // Format the response message with audio details
            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `	◦  *Title* : ${data.title}\n`;
            caption += `	◦  *Author* : ${data.author}\n`;
            caption += `	◦  *Duration* : ${data.duration}\n`;
            caption += `	◦  *Description* : ${data.description}\n`;
            caption += `	◦  *Audio URL* : ${data.audio}\n\n`;
            caption += global.footer;

            // Send the search result message with the thumbnail
            client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: data.thumbnail
            }).then(async () => {
                // Send the audio file URL for download
                client.sendFile(m.chat, data.audio, `${data.title}.mp3`, '', m, {
                    document: true,
                    APIC: await Func.fetchBuffer(data.thumbnail)
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
