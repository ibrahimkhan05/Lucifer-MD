const { youtube } = require('scrape-youtube');

exports.run = {
    usage: ['testttt'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, text }) => {
        try {
            youtube.search('Short Change Hero').then((results) => {
                // Unless you specify a custom type you will only receive 'video' results
                console.log(results);
            });

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
