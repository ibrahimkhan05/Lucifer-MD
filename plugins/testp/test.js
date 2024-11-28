const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

exports.run = {
    usage: ['getext'],
    hidden: [''],
    use: 'Downloads the file and returns its extension.',
    category: 'utility',
    async: async (m, { client }) => {
        try {
            // Check if the quoted message is a document
            const mediaMessage = m.quoted?.message?.documentMessage;

            if (!mediaMessage) {
                return client.reply(m.chat, '❌ Please reply to a document file to get its extension.', m);
            }

            // Download the document file
            const mediaBuffer = await client.downloadMediaMessage(m.quoted);

            // Get the file name and mime type
            const fileName = mediaMessage.fileName || 'unknown';
            const mimeType = mediaMessage.mimetype || mime.lookup(fileName);

            // Extract file extension
            const fileExtension = mime.extension(mimeType) || path.extname(fileName).slice(1);

            // Respond with the file extension
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
};
