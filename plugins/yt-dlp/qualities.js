const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Function to fetch video qualities
async function fetchQualities(url) {
    const scriptPath = path.resolve(__dirname, 'fetch_qualities.py');
    const command = `python3 ${scriptPath} ${url}`;


    try {
        const { stdout, stderr } = await execPromise(command, { shell: true });
        if (stderr) throw new Error(stderr);

        const result = JSON.parse(stdout);
        if (Array.isArray(result)) return result;
        if (result.error) throw new Error(result.error);
        throw new Error('Unexpected response format');
    } catch (error) {
        console.error(`Error fetching qualities: ${error.message}`);
        return { error: error.message };
    }
}

// Function to handle /ytdl command (Fetch and list qualities)
async function handleUserRequest(m, { client, text, isPrefix, command }) {
    const url = text.trim();
    const result = await fetchQualities(url);

    if (result.error) {
        return client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);
    }

    const formats = result;
    if (formats.length === 0) {
        client.replyButton(m.chat, [{
            text: 'Download',
            command: `${isPrefix}cvbi ${url}`
        }], m, {
            content: "Sorry, no qualities found for this video. You can still download it directly:",
            footer: global.footer,
            media: global.db.setting.cover
        });
    } else {
        const button = {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'Tap Here',
                sections: [{
                    rows: formats.map(format => ({
                        title: `${format.label} - Size: ${format.size ? format.size : 'Not available'}`,
                        id: `${isPrefix}cvbi ${url}`
                    }))
                }]
            })
        };

        client.sendIAMessage(m.chat, [button], m, {
            content: "Here are the qualities for this video. Select from the list:",
            footer: global.footer,
        });
    }
}

// Main exportable handler
exports.run = {
    usage: ['ytdl'],
    use: 'url',
    category: 'special',
    async: async (m, { client, Func, text, isPrefix, command }) => {
        try {
            if (command === 'ytdl') {
                if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);
                client.sendReact(m.chat, '🕒', m.key)
                await handleUserRequest(m, { client, text, isPrefix, command });
                
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
