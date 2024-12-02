const { handleXhMasterDownload, execXhMasterDownload } = require('../lib/system/functions/xhmater'); // Import functions

exports.run = {
    usage: ['xhmater', 'getxhmater'],
    use: 'url',
    category: 'special',
    async: async (m, { client, text, isPrefix, command }) => {
        try {
            if (command === 'xhmater') {
                await handleXhMasterDownload(m, { client, text, isPrefix, command });
            } else if (command === 'getxhmater') {
                const choice = parseInt(text.trim(), 10);
                await execXhMasterDownload(m, client, choice);
            }
        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, "❌ An error occurred. Please try again later.", m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
