const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Global object to manage video sessions
global.videoSessions = {};

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

// Function to handle the initial request for video quality selection
async function handleUserRequest(m, { client, text, isPrefix, command }) {
    if (!text) return client.reply(m.chat, `Usage: ${isPrefix}${command} <url>`, m);

    const url = text.trim();
    const result = await fetchQualities(url);

    if (result.error) return client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);

    const formats = result;
    if (formats.length === 0) return client.reply(m.chat, "No qualities found. Please try another video.", m);

    global.videoSessions[m.chat] = {
        url,
        formats,
        timeout: setTimeout(() => {
            delete global.videoSessions[m.chat];
            client.reply(m.chat, "Session expired. Please start again.", m);
        }, 300000) // 5 minutes
    };

    let qualityMessage = "Select a quality by replying with the corresponding number using /getytdl:\n\n";
    formats.forEach((format, index) => {
        qualityMessage += `*${index + 1}*. ${format.label} (${format.size || 'Size not available'})\n`;
    });

    client.reply(m.chat, qualityMessage, m);
}

// Function to handle /getytdl command and generate download link
async function handleGetYtdlCommand(m, { client, text }) {
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "No active session. Please start with /ytdl command first.", m);
    }

    const choice = parseInt(text.trim(), 10);
    console.log(`User selected choice for download link: ${choice}`); // Debugging log

    if (isNaN(choice) || choice < 1 || choice > session.formats.length) {
        return client.reply(m.chat, "Invalid choice. Please reply with a valid number.", m);
    }

    const selectedFormat = session.formats[choice - 1];
    const downloadLink = `/cvbi ${session.url} ${selectedFormat.id}`; // Simulate generating a download link

    await client.reply(m.chat, `Here is your download link:\n\n${downloadLink}`, m);

    clearTimeout(session.timeout);
    delete global.videoSessions[m.chat];
}

// Main exportable handler
exports.run = {
    usage: ['ytdl', 'getytdl'],
    use: 'url',
    category: 'special',
    async: async (m, { client, text, isPrefix, command }) => {
        try {
            if (command === 'ytdl') {
                await handleUserRequest(m, { client, text, isPrefix, command });
            } else if (command === 'getytdl') {
                await handleGetYtdlCommand(m, { client, text });
            }
        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, "An error occurred. Please try again later.", m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
