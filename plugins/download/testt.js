const { search, ytmp3, ytmp4, ytdlv2, channel } = require('@vreden/youtube_scraper');
exports.run = {
    usage: ['testtt'],
    use: 'youtube video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {

            const url = 'https://youtu.be/60ItHLz5WEA';

            // quality download, pilih di Quality Available
            const quality = "360"

            /* 
             * atau kamu bisa langsung url
             * saja untuk default quality (360)
             * example: ytmp4(url)
            */

            ytmp4(url, quality)
                .then(result => {
                    if (result.status) {
                        console.log('Download Link:', result.download);
                        console.log('Metadata:', result.metadata);
                    } else {
                        console.error('Error:', result.result);
                    }
                });
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
