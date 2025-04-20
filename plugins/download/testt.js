const yt = require("@justherza/ytdl-me")
exports.run = {
    usage: ['testtt'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            // 📂 Download Media
            yt.download({
                yt_link: "https://music.youtube.com/watch?v=m8Zqd58XuoA&list=OLAK5uy_n0t6KymP-tb3EUjViyWXXA4cT1raHJEl8", // Enter the YouTube video url here
                yt_format: "mp3", // Choose several formats to download, you can see it in the script configuration ./lib/config.js
                logs: false, // Just for check running (default: false)
                saveId: false // saves url to load in case anyone downloads with same url id (default: false)
            }).then(results => {
                console.log(results)
            })
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