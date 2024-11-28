const fs = require('fs');
const path = require('path');
const axios = require('axios');

exports.run = {
    usage: ['getext'],
    hidden: [''],
    use: 'Downloads the file and returns its extension.',
    category: 'utility',
    async: async (m, { client, args, text, env }) => {
        try {
            // Check if the message has a document attached
            if (!m.quoted || !m.quoted.documentMessage) {
                return client.reply(m.chat, '❌ Please reply to a document to get its extension.', m);
            }

            const documentUrl = await client.downloadMediaMessage(m.quoted); // Download the file
            const filePath = `./temp/${m.quoted.fileName}`; // Save it temporarily

            // Write the file to disk
            fs.writeFileSync(filePath, documentUrl);

            // Extract the file extension
            const fileExtension = path.extname(filePath).slice(1); // Remove the dot

            // Clean up (delete the file after processing)
            fs.unlinkSync(filePath);

            // Reply with the file extension
            client.reply(m.chat, `📄 The file extension is: *${fileExtension}*`, m);

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
}
