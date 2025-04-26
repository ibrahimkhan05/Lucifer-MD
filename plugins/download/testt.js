const axios = require('axios'); // Import axios for making API calls
const ytdl = require('ytdl-core'); // Import ytdl-core for downloading YouTube videos

exports.run = {
    usage: ['ytdlll'],
    use: 'video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'video URL'), m);

            client.sendReact(m.chat, '🕒', m.key); // Show a loading indicator

            const videoUrl = args.join(' '); // Get the YouTube URL from the arguments

            // Check if the URL is a valid YouTube URL
            const isValidUrl = ytdl.validateURL(videoUrl);
            if (!isValidUrl) return client.reply(m.chat, 'Invalid YouTube URL', m);

            // Fetch the video info (including available formats)
            const info = await ytdl.getInfo(videoUrl);

            // Try to get the 720p format first
            let format = ytdl.chooseFormat(info.formats, { quality: '720p' });

            // If 720p is not available, fallback to 480p
            if (!format) {
                format = ytdl.chooseFormat(info.formats, { quality: '480p' });
                if (!format) return client.reply(m.chat, 'No 480p video format available', m);
            }

            // Download the video in the selected format (either 720p or 480p)
            const downloadStream = ytdl(videoUrl, { format });

            // Upload the video as a file to the user
            client.sendFile(m.chat, downloadStream, `${info.videoDetails.title}.mp4`, `Here is your video: ${info.videoDetails.title}`, m, {
                document: true,
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
