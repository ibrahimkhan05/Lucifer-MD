const axios = require('axios');

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
                return client.reply(m.chat, '⚠️ Failed to fetch files. Please check the link or try again later.', m);
            }

            // Loop through each file in the result
            for (let file of jsonData.result) {
                if (file.files && file.files.length) {
                    // Get the download link for each file
                    const downloadLink = file.files[0].url;
                    const filename = file.name;

                    // Send the file to the chat
                    client.sendFile(m.chat, downloadLink, '', filename, m);
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
