const axios = require('axios');
const ddownr = require('denethdev-ytmp3');

exports.run = {
    usage: ['play'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'song name'), m);

            client.sendReact(m.chat, '🕒', m.key);

            // Step 1: Search via Delirius API
            const search = await axios.get(`https://delirius-apiofc.vercel.app/search/searchtrack?q=${encodeURIComponent(text)}`);
            const results = search.data;

            if (!results || results.length === 0) {
                return client.reply(m.chat, "❌ No results found.", m);
            }

            const song = results[0];
            const songUrl = song.url;
            const title = song.title;

            // Step 2: Use ddownr to get MP3 download link
            const result = await ddownr.download(songUrl, 'mp3');
            if (!result || !result.downloadUrl) {
                return client.reply(m.chat, "❌ Failed to retrieve download link.", m);
            }

            const downloadLink = result.downloadUrl;

            // Step 3: Send MP3 as document with only the API title
            await client.sendFile(m.chat, downloadLink, `${title}.mp3`, title, m, {
                document: true
            });

        } catch (err) {
            console.error(err);
            client.reply(m.chat, Func.jsonFormat(err), m);
        }
    },
    error: false,
    restrict: true,
    cache: true,
    location: __filename
};
