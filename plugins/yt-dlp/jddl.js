const path = require('path');
const fs = require('fs');
const Jdownloader = require('myjd-api');

exports.run = {
    usage: ['jddl'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://example.com/file.zip'), m);

        const link = args[0]; // URL provided by the user
        const email = 'your-email@example.com'; // Your JD email
        const password = 'your-password'; // Your JD password
        const deviceName = 'JDownloader'; // Device name in MyJDownloader
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download

        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        await client.reply(m.chat, '🔗 Connecting to JDownloader...', m);

        const myjd = new Jdownloader.MyJD(email, password);
        try {
            await myjd.connect();
            const device = await myjd.getDevice(deviceName);

            if (!device) {
                return client.reply(m.chat, '❌ JDownloader device not found.', m);
            }

            // Check the file info before downloading
            const fileInfo = await device.linkgrabber.addLinks([{
                autostart: false, // Don't start download immediately
                links: link
            }]);

            // Extract the file size and type
            const file = fileInfo[0];
            const fileSize = file.size;
            const fileSizeMB = fileSize / (1024 * 1024); // Convert to MB
            const fileName = file.name;
            const fileExtension = path.extname(fileName).toLowerCase();
            const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(fileExtension);
            const isImageOrGif = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(fileExtension);

            // Check if file size exceeds 1930MB
            if (fileSizeMB > 1930) {
                await client.reply(m.chat, `💀 File size (${fileSizeMB.toFixed(2)} MB) exceeds the 1930MB limit. Download canceled.`, m);
                return;
            }

            await client.reply(m.chat, `📥 Starting the download... (${fileSizeMB.toFixed(2)} MB)`, m);

            // Now start the download
            const downloadLinks = await device.linkgrabber.addLinks([{
                autostart: true,
                links: link
            }]);

            const downloadPath = path.join(outputDir, fileName);

            const pollDownload = async () => {
                const downloads = await device.downloads.queryLinks({ status: ['Finished'] });
                return downloads.find(d => d.name === fileName);
            };

            let download = null;
            let attempts = 0;
            while (attempts < 30) {
                download = await pollDownload();
                if (download) break;
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
                attempts++;
            }

            if (!download) {
                await client.reply(m.chat, '⚠️ Download failed or timed out.', m);
                return;
            }

            await client.reply(m.chat, `📤 Uploading your file: ${fileName} (${fileSizeMB.toFixed(2)} MB)...`, m);

            // Check if it's a video under 99MB and send directly
            if (isVideo && fileSizeMB <= 99) {
                await client.sendFile(m.chat, download.path, download.name, '', m, { video: true });
            }
            // Check if it's an image or GIF and send directly
            else if (isImageOrGif) {
                await client.sendFile(m.chat, download.path, download.name, '', m, { image: true });
            }
            // Otherwise, send as document
            else {
                await client.sendFile(m.chat, download.path, download.name, '', m, { document: true });
            }

            // Delete file after sending
            setTimeout(() => {
                if (fs.existsSync(download.path)) fs.unlinkSync(download.path);
            }, 5000); // 5-second delay before deletion

        } catch (err) {
            console.error('Error during JDownloader processing:', err);
            await client.reply(m.chat, '❌ Something went wrong. Please try again later.', m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
