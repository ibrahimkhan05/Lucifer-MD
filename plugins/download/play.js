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

            // Check if the audioData contains the expected structure
            if (audioData && audioData.data && audioData.data.audio) {
                const audioUrl = audioData.data.audio;

                // Download the file using axios
                const response = await axios({
                    url: audioUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                // Create a temporary file path to store the audio file
                const filePath = path.join(__dirname, `${firstResult.title}.mp3`);
                const writer = fs.createWriteStream(filePath);

                // Pipe the stream to the file
                response.data.pipe(writer);

                // Wait for the download to finish before sending the file
                writer.on('finish', () => {
                    // Send the downloaded audio file to the user as a .mp3 document without any caption
                    client.sendFile(m.chat, filePath, `${firstResult.title}.mp3`, '', m, {
                        document: true
                    }).then(() => {
                        // Clean up the temporary file after sending
                        fs.unlinkSync(filePath);
                    }).catch((error) => {
                        console.error('Error sending file:', error);
                    });
                });

                writer.on('error', (err) => {
                    console.error('Error writing file:', err);
                    client.reply(m.chat, "Failed to download the audio. Please try again later.", m);
                });

            } else {
                // Handle the case where audio data is not available
                client.reply(m.chat, "Audio download failed. Please try again later.", m);
            }

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
