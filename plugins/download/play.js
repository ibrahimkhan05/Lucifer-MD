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

            // Search for the song using the Delirius API
            const response = await axios.get(`https://delirius-apiofc.vercel.app/search/searchtrack?q=${text}`);
            const results = response.data;

            // Ensure we have search results
            if (!results || results.length === 0) {
                return client.reply(m.chat, "No results found for your search.", m);
            }

            // Get the first video result
            const firstResult = results[0];

            // Format the response with the desired structure
            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `◦  *Title* : ${firstResult.title}\n`;
            caption += `◦  *Artist* : ${firstResult.artist}\n`;
            caption += `◦  *Album* : ${firstResult.album}\n`;
            caption += `◦  *Duration* : ${firstResult.duration.label}\n`;
            caption += `◦  *URL* : ${firstResult.url}\n`;

            // Send the formatted message with song details
            client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: firstResult.image
            }).then(async () => {
                // Download the audio using the ytdown function
                const audioData = await ytdown(firstResult.url);

                // Send the audio file to the user
                client.sendFile(m.chat, audioData.mp3, `${firstResult.title}.mp3`, '', m, {
                    document: true,
                    APIC: await Func.fetchBuffer(firstResult.image)
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
