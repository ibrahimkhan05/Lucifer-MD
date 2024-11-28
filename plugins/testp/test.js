const fs = require('fs');  // Ensure fs is imported
const path = require('path');
const { execFile } = require('child_process');
const crypto = require('crypto');  // For random filename generation

exports.run = {
    usage: ['getext'],
    hidden: [''],
    use: 'Downloads the file and returns its extension.',
    category: 'utility',
    async: async (m, { client }) => {
        try {
            // Check if the replied message is NOT a text (i.e., it is a media message)
            if (m.quoted && !m.quoted.text) {
                // Download the media file (could be document, image, video, etc.)
                const media = await m.quoted.download();
                if (!media) {
                    return client.reply(m.chat, '❌ Failed to download the media.', m);
                }

                // Generate a random file name for the downloaded media
                const randomFileName = crypto.randomBytes(16).toString('hex');
                const filePath = path.join(__dirname, 'downloads', randomFileName);

                // Ensure the 'downloads' folder exists
                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }

                // Save the media to the file
                fs.writeFileSync(filePath, media, 'base64');
                console.log(`File saved at: ${filePath}`);

                // Correct path to the Python script
                const pythonScriptPath = path.join(__dirname, 'get_extension.py');  // Correct the path here

                // Call Python script to get file extension
                execFile('python3', [pythonScriptPath, filePath], (error, stdout, stderr) => {
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

            } else {
                // If it's a text message or no media, send an error message
                client.reply(m.chat, '❌ Please reply to a media file (document, image, video, etc.) to get its extension.', m);
            }

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
