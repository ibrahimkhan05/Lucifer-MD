const axios = require('axios');
const { Youtube } = require('@neoxr/youtube-scraper')
const yt = new Youtube({
   fileAsUrl: false
})

exports.run = {
    usage: ['test'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, text }) => {
        try {
            yt.play('Alan walker faded').then(console.log)
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
