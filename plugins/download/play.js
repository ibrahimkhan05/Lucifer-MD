const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['play'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, users, env, Func, Scraper }) => {
        try {
            // Check if a query is provided
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'song name or URL'), m);

            // Send a reaction to indicate processing
            client.sendReact(m.chat, '🕒', m.key);

            // Assuming the user provides a URL for the audio file (direct download link)
            const audioUrl = text;

            // Check if the URL is valid
            if (!audioUrl.startsWith('http') || !audioUrl.includes('.mp3')) {
                return client.reply(m.chat, "Please provide a valid audio URL.", m);
            }

            // Download the audio file using axios
            const response = await axios({
                url: audioUrl,
                method: 'GET',
                responseType: 'arraybuffer',  // Download the content as a buffer
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                    'Accept': 'audio/mpeg', // Set the content type for audio
                }
            });

            // Create a temporary file path to store the audio file
            const fileName = `${path.basename(audioUrl)}.mp3`;
            const filePath = path.join(__dirname, fileName);

            // Write the audio file to disk
            fs.writeFile(filePath, response.data, (err) => {
                if (err) {
                    console.error('Error saving the audio file:', err);
                    return client.reply(m.chat, "Failed to download the audio. Please try again later.", m);
                }

                // Send the downloaded audio file to the user as a .mp3 document without any caption
                client.sendFile(m.chat, filePath, fileName, '', m, { document: true }).then(() => {
                    // Clean up the temporary file after sending
                    fs.unlinkSync(filePath);
                }).catch((error) => {
                    console.error('Error sending file:', error);
                    client.reply(m.chat, "Error sending the file. Please try again later.", m);
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
