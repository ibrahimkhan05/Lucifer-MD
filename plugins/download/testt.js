const  https = require('https');
exports.run = {
    usage: ['testtt'],
    use: 'youtube video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {

            const https = require('https');

            const url = 'https://cdn306.savetube.su/download-direct/video/360/43650049619893a6aae7b5262e5fbf695b3ccdd3';
            
            https.get(url, {
              headers: {
                'Range': 'bytes=0-0',
                'User-Agent': 'Mozilla/5.0'
              }
            }, res => {
              const range = res.headers['content-range'];
              const match = /\/(\d+)$/.exec(range);
              if (match) {
                const size = parseInt(match[1]);
                console.log('Size in MB:', (size / 1024 / 1024).toFixed(2));
              } else {
                console.log('Could not determine file size.');
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
