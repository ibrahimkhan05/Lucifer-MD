const { Youtube } = require('@neoxr/youtube-scraper')
const yt = new Youtube({
   fileAsUrl: false,
   proxy: {
      host: 'sg.xzcdn.live',
      port: 29841
   }
})
exports.run = {
    usage: ['testtt'],
    use: 'youtube video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            yt.play('wide awake').then(console.log)
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, 'An error occurred while processing your request.', m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
