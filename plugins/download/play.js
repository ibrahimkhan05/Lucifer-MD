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

            // Step 1: Search via Delirius API
            const searchRes = await axios.get(`https://delirius-apiofc.vercel.app/search/searchtrack?q=${encodeURIComponent(text)}`);
            const results = searchRes.data;

            if (!results || results.length === 0) {
                return client.reply(m.chat, "❌ No results found.", m);
            }

            const first = results[0];
            const ytUrl = first.url;

            // Step 2: Use @justherza/ytdl-me to download MP3
            const dl = await yt.download({
                yt_link: ytUrl,
                yt_format: "mp3",
                logs: false,
                saveId: false
            });

            if (!dl || !dl.media) {
                return client.reply(m.chat, "❌ Failed to get download link.", m);
            }

            // Step 3: Send media URL as file
            const title = dl.info?.title || 'audio';
            await client.sendFile(m.chat, dl.media, `${title}.mp3`, `${title}`, m, {
                document: true
            });

        } catch (e) {
            console.error(e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    restrict: true,
    cache: true,
    location: __filename
};
