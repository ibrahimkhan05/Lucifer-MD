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

                // Download the file using axios directly, no streaming
                const response = await axios({
                    url: audioUrl,
                    method: 'GET',
                    responseType: 'arraybuffer', // Get the response as a buffer (this is usually the format for direct downloads)
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                        'Accept': 'audio/mpeg', // You can set the proper content-type here
                    }
                });

                // Create a temporary file path to store the audio file
                const filePath = path.join(__dirname, `${firstResult.title}.mp3`);

                // Write the buffer to a file
                fs.writeFile(filePath, response.data, (err) => {
                    if (err) {
                        console.error('Error saving the audio file:', err);
                        return client.reply(m.chat, "Failed to download the audio. Please try again later.", m);
                    }

                    // Send the downloaded audio file to the user as a .mp3 document without any caption
                    client.sendFile(m.chat, filePath, `${firstResult.title}.mp3`, '', m, {
                        document: true
                    }).then(() => {
                        // Clean up the temporary file after sending
                        fs.unlinkSync(filePath);
                    }).catch((error) => {
                        console.error('Error sending file:', error);
                        client.reply(m.chat, "Error sending the file. Please try again later.", m);
                    });
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
