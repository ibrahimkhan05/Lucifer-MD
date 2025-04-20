const axios = require('axios');

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

            // Step 2: Get MP3 from BK9 API
            const bk9Res = await axios.get(`https://bk9.fun/download/ytmp3?url=${encodeURIComponent(ytUrl)}&type=mp3`);
            const data = bk9Res.data;

            if (!data.status || !data.BK9 || !data.BK9.downloadUrl) {
                return client.reply(m.chat, "❌ Failed to get download link.", m);
            }

            const { title, downloadUrl } = data.BK9;

            // Step 3: Send MP3 directly as a document from remote URL
            await client.sendFile(m.chat, downloadUrl, `${title}.mp3`, '', m, {
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
