const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Global object to manage video sessions
global.videoSessions = {};

// Function to fetch video qualities using a Python script
async function fetchQualities(url) {
    const scriptPath = path.resolve(__dirname, 'fetch_qualities.py');
    const command = `python3 ${scriptPath} ${url}`;

    try {
        const { stdout, stderr } = await execPromise(command, { shell: true });

        if (stderr) {
            throw new Error(stderr);
        }

        const result = JSON.parse(stdout);

        if (Array.isArray(result)) {
            return result;
        } else if (result.error) {
            throw new Error(result.error);
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error(`Error fetching qualities: ${error.message}`);
        return { error: error.message };
    }
}

// Function to handle the initial request for video quality selection
async function handleUserRequest(m, { client, text, isPrefix, command }) {
    if (!text) {
        return client.reply(m.chat, `Usage: ${isPrefix}${command} <url>`, m);
    }

    const url = text.trim();
    const result = await fetchQualities(url);

    if (result.error) {
        return client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);
    }

    const formats = result;
    if (formats.length === 0) {
        return client.reply(m.chat, "No qualities found. Please try another video.", m);
    }

    // Save the session with a 5-minute timeout
    global.videoSessions[m.chat] = {
        url,
        formats,
        timeout: setTimeout(() => {
            delete global.videoSessions[m.chat];
            client.reply(m.chat, "Session expired. Please start again.", m);
        }, 300000) // 5 minutes
    };

    // Send quality options to user
    let qualityMessage = "Select a quality by replying with the corresponding number:\n\n";
    formats.forEach((format, index) => {
        qualityMessage += `*${index + 1}*. ${format.label} (${format.size || 'Size not available'})\n`;
    });

    client.reply(m.chat, qualityMessage, m);
}

// Function to handle user selection of a quality
async function handleQualitySelection(m, { client }) {
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "No active session. Please start with the command again.", m);
    }

    // Parse user input
    const choice = parseInt(m.body.trim(), 10);
    if (isNaN(choice) || choice < 1 || choice > session.formats.length) {
        return client.reply(m.chat, "Invalid choice. Please reply with a valid number.", m);
    }

    // Prepare the download command
    const selectedFormat = session.formats[choice - 1];
    const downloadCommand = `/cvbi ${session.url} ${selectedFormat.id}`;

    // Send download command to user
    await client.reply(m.chat, `Download command: ${downloadCommand}`, m);

    // Clear the session
    clearTimeout(session.timeout);
    delete global.videoSessions[m.chat];
}

// Main exportable handler for the bot
exports.run = {
    usage: ['ytdl'],
    use: 'url',
    category: 'special',
    async: async (m, { client, text, isPrefix, command }) => {
        try {
            // Determine whether to handle quality selection or start a new session
            if (global.videoSessions[m.chat]) {
                await handleQualitySelection(m, { client });
            } else {
                await handleUserRequest(m, { client, text, isPrefix, command });
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
