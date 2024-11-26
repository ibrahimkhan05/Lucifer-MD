const axios = require('axios');
const path = require('path');  // Import path module to get file extension

// List of allowed extensions (you can expand this list)
const allowedExtensions = ['.mp4', '.jpg', '.jpeg', '.png', '.pdf', '.mp3'];

exports.run = {
    usage: ['terabox'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, text }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'your link'), m);
            client.sendReact(m.chat, '🕒', m.key);

            const response = await axios.get(`https://api.betabotz.eu.org/api/download/terabox?url=${encodeURIComponent(text)}&apikey=beta-Ibrahim1209`);
            const jsonData = response.data;

            // Check if response contains files
            if (!jsonData || !jsonData.result || !jsonData.result.length) {
                console.log('No files found or invalid response:', jsonData);
                return client.reply(m.chat, '⚠️ Failed to fetch files. Please check the link or try again later.', m);
            }

            // Loop through each file in the result
            for (let file of jsonData.result) {
                if (file.files && file.files.length) {
                    const downloadLink = file.files[0].url;
                    const filename = file.name;

                    // Get file extension
                    const extname = path.extname(filename).toLowerCase();

                    // Check if the file extension is valid
                    if (!allowedExtensions.includes(extname)) {
                        console.log(`Skipping file with invalid extension: ${filename}`);
                        continue; // Skip file if extension is not allowed
                    }

                    // Log download link and file name for debugging
                    console.log(`Sending file: ${filename}`);
                    console.log(`Download link: ${downloadLink}`);

                    // Send the file to the chat
                    await client.sendFile(m.chat, downloadLink, filename, '', m);
                }
            }
        } catch (e) {
            console.error('Error occurred:', e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
