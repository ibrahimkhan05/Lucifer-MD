const { ytmp3 } = require('ruhend-scraper')
exports.run = {
    usage: ['testtt'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            // 📂 Download Media
            const data = await ytmp3("https://www.youtube.com/watch?v=5eE43T-4vow")
             console.log(data)
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