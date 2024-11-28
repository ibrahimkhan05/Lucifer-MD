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
            // Check if the message has any media (document, image, video, audio)
            if (!m.quoted || !m.quoted.mediaMessage) {
                return client.reply(m.chat, '❌ Please reply to a media file (document, image, video, etc.) to get its extension.', m);
            }

            // Download the media file
            const mediaBuffer = await client.downloadMediaMessage(m.quoted);

            // Get the original file name and mime type
            const fileName = m.quoted.fileName || 'unknown';
            const mimeType = m.quoted.mimetype || mime.lookup(fileName);

            // Extract the file extension from either the MIME type or the file name
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
