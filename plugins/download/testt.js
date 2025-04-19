const { ytdown } = require("nayan-videos-downloader")
exports.run = {
    usage: ['testtt'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            let URL = await ytdown("https://youtu.be/pIWaVJPl0-c")
            console.log(URL)
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
 