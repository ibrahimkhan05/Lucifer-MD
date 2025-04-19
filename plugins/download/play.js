const axios = require('axios');
const { ytdown } = require('nayan-videos-downloader');

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

            // Search for the song using the Delirius API or your custom Scraper API
            const response = await axios.get(`https://delirius-apiofc.vercel.app/search/searchtrack?q=${text}`);
            const results = response.data;

            // Ensure we have search results
            if (!results || !results.data) {
                return client.reply(m.chat, "No results found for your search.", m);
            }

            // Get the first song result
            const firstResult = results.data;

            // Format the response with the desired structure
            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `◦  *Title* : ${firstResult.title}\n`;
            caption += `◦  *Artist* : ${firstResult.artist}\n`;
            caption += `◦  *Album* : ${firstResult.album || 'Not available'}\n`;
            caption += `◦  *Duration* : ${firstResult.duration || 'Not available'}\n`;
            caption += `◦  *Quality* : ${firstResult.quality || 'Not available'}\n`;
            caption += `◦  *URL* : ${firstResult.video || 'Not available'}\n`;

            // Send the formatted message with song details
            client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: firstResult.thumb || 'default_thumbnail_url.jpg'
            }).then(async () => {
                // Send the audio file as a document using the audio URL from the scraper response
                const audioUrl = firstResult.audio;
                client.sendFile(m.chat, audioUrl, `${firstResult.title}.webm`, '', m, { document: true });
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
