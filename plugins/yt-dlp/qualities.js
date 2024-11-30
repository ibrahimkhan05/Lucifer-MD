const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Store sessions globally
global.videoSessions = global.videoSessions || {};

// Function to fetch video qualities using Python script
async function fetchQualities(url) {
    const scriptPath = path.resolve(__dirname, 'fetch_qualities.py');
    const command = `python3 ${scriptPath} ${url}`;

    try {
        const { stdout, stderr } = await execPromise(command, { shell: true });

        if (stderr) throw new Error(stderr);

        const result = JSON.parse(stdout);
        return Array.isArray(result) ? result : { error: result.error || 'Unexpected response format' };
    } catch (error) {
        console.error(`Error fetching qualities: ${error.message}`);
        return { error: error.message };
    }
}

// Function to handle user request for fetching qualities and starting the session
async function handleUserRequest(m, { client, text, isPrefix, command }) {
    if (!text) {
        return client.reply(m.chat, `Usage: ${isPrefix}${command} <url>`, m);
    }

    const url = text.split(' ')[0];
    const result = await fetchQualities(url);

    if (result.error) {
        return client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);
    }

    const formats = result;

    if (formats.length === 0) {
        return client.reply(m.chat, "No specific qualities available. Downloading in default quality.", m);
    }

    // Save session for this chat
    global.videoSessions[m.chat] = {
        url,
        formats,
        created_at: Date.now(),
        timeout: setTimeout(() => {
            delete global.videoSessions[m.chat];
        }, 5 * 60 * 1000) // 5-minute timeout
    };

    // Send list of qualities to the user
    let message = `Select a quality by replying with the corresponding number:\n\n`;
    formats.forEach((format, index) => {
        message += `${index + 1}. ${format.label} (${format.size})\n`;
    });

    await client.reply(m.chat, message, m);
}

// Function to handle user selection and download
async function handleQualitySelection(m, { client }) {
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "No active session. Start with the command again.", m);
    }

    const choice = parseInt(m.body.trim(), 10);
    if (isNaN(choice) || choice < 1 || choice > session.formats.length) {
        return client.reply(m.chat, "Invalid choice. Please reply with a valid number.", m);
    }

    const selectedFormat = session.formats[choice - 1];
    const downloadCommand = `/cvbi ${session.url} ${selectedFormat.id}`;

    // Trigger the download
    await client.reply(m.chat, `Downloading: ${selectedFormat.label} (${selectedFormat.size})`, m);

    // Execute the download command
    try {
        await execPromise(downloadCommand, { shell: true });
        await client.reply(m.chat, "Download completed successfully.", m);
    } catch (error) {
        console.error(`Download error: ${error.message}`);
        await client.reply(m.chat, "Error during download. Please try again.", m);
    }

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
            // Check if a session already exists for this chat
            if (global.videoSessions[m.chat]) {
                await handleQualitySelection(m, { client });
            } else {
                await handleUserRequest(m, { client, text, isPrefix, command });
            }
        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
