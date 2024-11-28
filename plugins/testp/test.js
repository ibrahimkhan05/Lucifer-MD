const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['getext'],
    hidden: [''],
    use: 'Downloads the file and returns its extension.',
    category: 'utility',
    async: async (m, { client }) => {
        try {
            // Check if the replied message is a document or media
            const isDocument = m.quoted?.message?.documentMessage;
            const isImage = m.quoted?.message?.imageMessage;
            const isVideo = m.quoted?.message?.videoMessage;

            if (!isDocument && !isImage && !isVideo) {
                return client.reply(m.chat, '❌ Please reply to a media file (document, image, video, etc.) to get its extension.', m);
            }

            // Download the media file (Document/Image/Video)
            const media = await m.quoted.download();
            if (!media) {
                return client.reply(m.chat, '❌ Failed to download the media.', m);
            }

            // Generate a file path to save the downloaded file
            const fileName = m.quoted?.message?.documentMessage?.fileName || 'unknown';
            const filePath = path.join(__dirname, 'downloads', fileName);

            // Ensure the 'downloads' folder exists
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }

            // Save the media to the file
            fs.writeFileSync(filePath, media, 'base64');
            console.log(`File saved at: ${filePath}`);

            // Call Python script to get file extension
            execFile('python3', ['get_extension.py', filePath], (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return client.reply(m.chat, '❌ Error occurred while processing the file.', m);
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }

                // Log and send the extension to the user
                const extension = stdout.trim();
                console.log(`File extension: ${extension}`);

                // Send the result back to the user
                client.reply(m.chat, `📄 The file extension is: ${extension}`, m);

                // After processing, delete the file
                fs.unlinkSync(filePath);
                console.log('File deleted after logging.');
            });

        } catch (e) {
            console.log(e);
            client.reply(m.chat, '❌ Error processing the file. Please try again.', m);
        }
    },
    error: false,
    limit: true,
    restrict: true,
    cache: true,
    location: __filename
};
