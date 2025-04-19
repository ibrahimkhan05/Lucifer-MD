const axios = require('axios');
const { ytdown } = require('nayan-videos-downloader');
const fs = require('fs');
const path = require('path');

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

            // Get the first song result
            const firstResult = results[0];

            // Download the audio using the ytdown function from the song URL
            const audioData = await ytdown(firstResult.url);
            const audioUrl = audioData.result.audio;

            // Fetch the audio from the URL
            const audioResponse = await axios({
                method: 'get',
                url: audioUrl,
                responseType: 'stream'
            });

            // Define the path where the file will be saved temporarily
            const filePath = path.join(__dirname, `${firstResult.title}.mp3`);

            // Write the audio stream to a file
            const writer = fs.createWriteStream(filePath);
            audioResponse.data.pipe(writer);

            // Wait for the file to be fully written before sending
            writer.on('finish', () => {
                // Send the audio file to the user as a .mp3 document without any caption
                client.sendFile(m.chat, filePath, `${firstResult.title}.mp3`, '', m, {
                    document: true
                });

                // Optionally, remove the file after sending
                fs.unlinkSync(filePath);
            });

            writer.on('error', (err) => {
                console.error(err);
                client.reply(m.chat, "An error occurred while downloading the audio.", m);
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
