const fs = require('fs');
const { execFile } = require('child_process');

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

            const file = m.quoted.message.documentMessage || m.quoted.message.imageMessage || m.quoted.message.videoMessage;
            const fileName = file.fileName || 'unknown';

            // Save the file (this part should be implemented properly depending on how the file is received)
            // For now, assume you have the file path saved to `filePath`

            // Assuming `filePath` is the path to the saved file
            const filePath = '/root/Lucifer-MD/plugins/testp/downloads/unknown'; // Example path

            // Run Python script to process the file extension
            execFile('python3', ['get_extension.py', filePath], (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return client.reply(m.chat, '❌ Error occurred while processing the file.', m);
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }

                // Log the extension and file details
                const fileExtension = stdout.trim();
                client.reply(m.chat, `📄 The file extension is: ${fileExtension}`, m);

                // Now rename the file with the extension
                const newFileName = filePath + fileExtension;
                fs.rename(filePath, newFileName, (renameError) => {
                    if (renameError) {
                        console.error('Error renaming file:', renameError);
                    } else {
                        console.log(`File saved as: ${newFileName}`);
                    }

                    // Delete the file after logging its extension
                    fs.unlink(newFileName, (deleteError) => {
                        if (deleteError) {
                            console.error('Error deleting file:', deleteError);
                        } else {
                            console.log(`File deleted after logging.`);
                        }
                    });
                });
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
