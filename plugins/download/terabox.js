const axios = require('axios');

exports.run = {
    usage: ['terabox'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, text }) => {
        try {
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'your link'), m);
            }
            
            client.sendReact(m.chat, '🕒', m.key);

            // Fetch data from the API
            const response = await axios.get(`https://api.betabotz.eu.org/api/download/terabox?url=${encodeURIComponent(text)}&apikey=${global.betabotz}`);
            const jsonData = response.data;

            // Check if the response contains valid files
            if (!jsonData || jsonData.status !== "true" || !jsonData.result || !jsonData.result.length) {
                return client.reply(m.chat, '⚠️ Failed to fetch files. Please check the link or try again later.', m);
            }

            // Loop through the files and get the download URLs
            for (let file of jsonData.result) {
                if (file.files && file.files.length > 0) {
                    for (let fileData of file.files) {
                        const downloadUrl = fileData.url; // Extracted download URL
                        const filename = fileData.filename;

                        // Fetch the actual file
                        const fileResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });

                        // Send the file to the chat
                        await client.sendFile(m.chat, fileResponse.data, filename, '', m);
                    }
                }
            }
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, '❌ An error occurred while processing your request.', m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
