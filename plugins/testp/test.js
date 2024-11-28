const { execFile } = require('child_process');

exports.run = {
    usage: ['getext'],
    hidden: [''],
    use: 'Downloads the file and returns its extension.',
    category: 'utility',
    async: async (m, { client }) => {
        try {
            if (!m.quoted || !m.quoted.message || !m.quoted.message.documentMessage) {
                return client.reply(m.chat, '❌ Please reply to a media file (document, image, video, etc.) to get its extension.', m);
            }

            const document = m.quoted.message.documentMessage;
            const fileName = document.fileName || 'unknown';

            // Call Python script to get file extension
            execFile('python3', ['get_extension.py', fileName], (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return client.reply(m.chat, '❌ Error occurred while processing the file.', m);
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }

                // Send the result back to the user
                client.reply(m.chat, `📄 The file extension is: ${stdout.trim()}`, m);
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
