const { search, ytmp3, ytmp4, ytdlv2, channel } = require('@vreden/youtube_scraper');
exports.run = {
    usage: ['testtt'],
    use: 'youtube video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            const query = 'Alan Walker Faded';

            search(query)
                .then(result => {
                    if (result.status) {
                        console.log('Search Results:', result.results);
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
