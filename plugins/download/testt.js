const { search, ytmp3, ytmp4, ytdlv2, channel } = require('@vreden/youtube_scraper');
exports.run = {
    usage: ['testtt'],
    use: 'youtube video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            // url YouTube kamu
const url = 'https://youtu.be/8of5w7RgcTc?list=RD8of5w7RgcTc';

/*
 * quality download
 * pilih di Quality Available
 * bisa dalam format audio
 * maupun video
 */

const quality = 128

/* 
 * atau kamu bisa langsung url
 * saja untuk default quality (128 & 360)
 * example: ytdlv2(url)
*/

ytdlv2(url, quality)
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
