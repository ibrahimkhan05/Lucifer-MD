const { terabox } = require("nayan-videos-downloader");
exports.run = {
    usage: ['testtt'],
    use: 'youtube video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            const url = "https://teraboxlink.com/s/1W8ru115PP8VY6QDNnFXZLQ"
            let data = await terabox(url);
            console.log(data);
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
