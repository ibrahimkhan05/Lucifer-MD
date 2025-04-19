const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['play'],
    use: 'song name',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'shape of you'), m);
            client.sendReact(m.chat, '🎵', m.key);

            // Call Python script
            exec(`python3 download_song.py "${text}"`, async (err, stdout, stderr) => {
                if (err || stderr || stdout.includes('ERROR::')) {
                    return client.reply(m.chat, "❌ Failed to download the song.", m);
                }

                const filePath = stdout.trim();
                const fileName = path.basename(filePath);

                await client.sendFile(m.chat, filePath, fileName, '', m, {
                    document: true
                });

                fs.unlinkSync(filePath); // cleanup
            });

        } catch (e) {
            console.error(e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    restrict: true,
    cache: true,
    location: __filename
};
