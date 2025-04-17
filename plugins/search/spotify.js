const axios = require('axios');

exports.run = {
    usage: ['spotify'],
    use: 'query',
    category: 'search',
    async: async (m, { client, text, Func, isPrefix, command }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'dj dalinda'), m);

            client.sendReact(m.chat, '🕒', m.key);

            // New API integration
            const response = await axios.get(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}&limit=20`);

            if (!response.data.status) return client.reply(m.chat, Func.jsonFormat(response.data), m);

            const results = response.data.data;
            if (!results.length) return client.reply(m.chat, 'No results found!', m);

            const listOptions = results.map((v) => ({
                title: `${v.title} - ${v.artist}`,
                description: `${v.album} (${v.duration})`,
                id: `${isPrefix}spotifydl ${v.url}`
            }));

            await client.sendIAMessage(m.chat, [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: 'Select a song',
                    sections: [{ rows: listOptions }]
                })
            }], m, {
                header: '',
                content: '🎵 *Spotify Search Results* 🎵',
                footer: global.footer,
                media: '' // Include thumbnail in the message
            });

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
