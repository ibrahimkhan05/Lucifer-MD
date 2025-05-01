const https = require('https');
exports.run = {
    usage: ['testtt'],
    use: 'youtube video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {

            https.request('https://cdn306.savetube.su/download-direct/video/360/43650049619893a6aae7b5262e5fbf695b3ccdd3', { method: 'HEAD' }, res => {
                const size = res.headers['content-length'];
                console.log('Size in MB:', (size / 1024 / 1024).toFixed(2));
              }).end();
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
