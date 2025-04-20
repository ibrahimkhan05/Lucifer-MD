const axios = require('axios');
const yt = require("@justherza/ytdl-me");

exports.run = {
    usage: ['play'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'song name'), m);

            client.sendReact(m.chat, '🕒', m.key);

            // Search for the song using Delirius API
            const search = await axios.get(`https://delirius-apiofc.vercel.app/search/searchtrack?q=${encodeURIComponent(text)}`);
            const results = search.data;

            if (!results || !results.length) {
                return client.reply(m.chat, '❌ No results found.', m);
            }

            const firstResult = results[0];
            const videoUrl = firstResult.url;

            // Download audio using @justherza/ytdl-me
            const dl = await yt.download({
                yt_link: videoUrl,
                yt_format: "mp3",
                logs: false,
                saveId: false
            });

            if (!dl || !dl.media) {
                return client.reply(m.chat, '❌ Failed to retrieve download link.', m);
            }

            // Clean the title for safe file naming
            const title = dl.info?.title?.replace(/[\\/:*?"<>|]/g, '') || 'audio';

            // Send the MP3 as a document
            await client.sendFile(m.chat, dl.media, `${title}.mp3`, title, m, {
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
