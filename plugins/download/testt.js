const axios = require('axios');
const cheerio = require('cheerio');

const Y2MATE_URL = 'https://www.y2mate.com/youtube';

exports.run = {
    usage: ['ytdlll'],
    use: 'youtube video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'YouTube video URL'), m);

            client.sendReact(m.chat, '🕒', m.key);

            const videoUrl = args.join(' ');

            // Function to get download link from Y2Mate
            async function getDownloadLink(videoUrl) {
                try {
                    // Get the Y2Mate page for the video URL
                    const { data } = await axios.post(Y2MATE_URL, { url: videoUrl });

                    // Load the page content with cheerio
                    const $ = cheerio.load(data);

                    // Find the download links
                    const downloadLinks = [];
                    $('a[data-video-url]').each((index, element) => {
                        const downloadUrl = $(element).attr('href');
                        const quality = $(element).text().trim();
                        downloadLinks.push({ quality, downloadUrl });
                    });

                    // Check if we have any download links
                    if (downloadLinks.length === 0) {
                        throw new Error('No download links found.');
                    }

                    return downloadLinks;
                } catch (error) {
                    console.error('Error while scraping Y2Mate:', error.message);
                    throw error;
                }
            }

            // Fetch download links
            const downloadLinks = await getDownloadLink(videoUrl);
            if (!downloadLinks) {
                return client.reply(m.chat, 'Failed to fetch download links.', m);
            }

            // Check for 720p link, if not available use 480p
            let downloadUrl = downloadLinks.find(link => link.quality.includes('720p'))?.downloadUrl;
            if (!downloadUrl) {
                downloadUrl = downloadLinks.find(link => link.quality.includes('480p'))?.downloadUrl;
            }

            if (!downloadUrl) {
                return client.reply(m.chat, 'No suitable download quality found.', m);
            }

            // Send the video download link to the user
            client.reply(m.chat, `Here is your download link: ${downloadUrl}`, m);

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
