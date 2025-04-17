const axios = require('axios');

exports.run = {
    usage: ['app'],
    use: 'query',
    category: 'search',
    async: async (m, { client, text, Func, isPrefix, command }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'WhatsApp'), m);

            client.sendReact(m.chat, '🔍', m.key);

            const response = await axios.get(`https://delirius-apiofc.vercel.app/search/playstore?q=${encodeURIComponent(text)}`);

            if (!response.data.status || !response.data.data.length)
                return client.reply(m.chat, 'No results found or failed to fetch results!', m);

            const results = response.data.data;

            const listOptions = results.map((app) => ({
                title: app.name,
                description: `${app.developer} | ⭐ ${app.rating_num}`,
                id: `${isPrefix}apkdl ${app.link}`
            }));

            await client.sendIAMessage(m.chat, [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: 'Select an app to download',
                    sections: [{ rows: listOptions }]
                })
            }], m, {
                header: '',
                content: '📱 *Play Store Search Results*',
                footer: global.footer,
                media: '' // You can optionally add thumbnails here
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
