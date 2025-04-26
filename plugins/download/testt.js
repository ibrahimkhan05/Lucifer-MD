const axios = require('axios'); // Import axios for making API calls
const ytdl = require('ytdl-core'); // Import ytdl-core for downloading YouTube videos
const fs = require('fs'); // Import fs module for file system operations
const path = require('path'); // Import path module to manage file paths

exports.run = {
    usage: ['ytdlll'],
    use: 'video URL',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) {
                client.reply(m.chat, Func.example(isPrefix, command, 'video URL'), m);
                return;
            }

            client.sendReact(m.chat, '🕒', m.key); // Show a loading indicator

            const videoUrl = args.join(' '); // Get the YouTube URL from the arguments
            console.log(`Received video URL: ${videoUrl}`);

            // Check if the URL is a valid YouTube URL
            const isValidUrl = ytdl.validateURL(videoUrl);
            if (!isValidUrl) {
                client.reply(m.chat, 'Invalid YouTube URL', m);
                console.error('Invalid YouTube URL provided');
                return;
            }

            // Fetch the video info (including available formats)
            const info = await ytdl.getInfo(videoUrl);
            console.log('Video info fetched:', info.videoDetails.title);

            // Try to get the 720p format first
            let format = ytdl.chooseFormat(info.formats, { quality: '720p' });

            // If 720p is not available, fallback to 480p
            if (!format) {
                format = ytdl.chooseFormat(info.formats, { quality: '480p' });
                if (!format) {
                    client.reply(m.chat, 'No 480p video format available', m);
                    console.error('No valid video format available (720p or 480p)');
                    return;
                }
            }

            console.log('Selected video format:', format);

            // Create a temporary file for the video download
            const tempFilePath = path.join(__dirname, `${info.videoDetails.title}.mp4`);
            console.log(`Downloading video to: ${tempFilePath}`);

            const fileStream = fs.createWriteStream(tempFilePath);

            // Download the video and pipe it to the temporary file
            ytdl(videoUrl, { format })
                .pipe(fileStream)
                .on('finish', async () => {
                    console.log('Video download complete. Uploading to user...');

                    // Upload the video file after the download is complete
                    await client.sendFile(m.chat, tempFilePath, `${info.videoDetails.title}.mp4`, `Here is your video: ${info.videoDetails.title}`, m, { document: true });

                    // Delete the temporary file after sending it to the user
                    fs.unlink(tempFilePath, (err) => {
                        if (err) {
                            console.error('Error deleting the file:', err);
                        } else {
                            console.log('Temporary file deleted successfully');
                        }
                    });
                })
                .on('error', (err) => {
                    console.error('Error downloading video:', err);
                    return client.reply(m.chat, 'An error occurred while downloading the video.', m);
                });

        } catch (e) {
            console.error('Error during processing:', e);
            return client.reply(m.chat, 'An error occurred while processing your request.', m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
