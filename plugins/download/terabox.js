const axios = require('axios');

exports.run = {
    usage: ['terabox'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, text }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'your link'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // Fetch data from the API
            const response = await axios.get(`https://api.betabotz.eu.org/api/download/terabox?url=${encodeURIComponent(text)}&apikey=${global.betabotz}`);
            const jsonData = response.data;

            // Check if the response contains valid files
            if (!jsonData || !jsonData.result || !jsonData.result.length) {
                return client.reply(m.chat, '⚠️ Failed to fetch files. Please check the link or try again later.', m);
            }

            // Loop through the files and get the download URL
            for (let file of jsonData.result) {
                if (file.files && file.files.length) {
                    const downloadUrl = file.files[0].url; // This is the redirected URL
                    const filename = file.name;

                    // Use the download URL to fetch the actual file
                    const fileResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });

                    // Send the file to the chat
                    client.sendFile(m.chat, fileResponse.data, filename, '', m);
                }
            }
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
