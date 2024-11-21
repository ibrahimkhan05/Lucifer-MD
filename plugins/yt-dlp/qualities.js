const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Global object for session storage
global.userSessions = {};

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

// Function to handle user requests for fetching qualities
async function handleUserRequest(m, { client, text, isPrefix, command, Func }) {
    if (!text) {
        return client.reply(m.chat, `Usage: ${isPrefix}${command} <url>`, m);
    }

    const url = text.split(' ')[0];
    const result = await fetchQualities(url);

    if (result.error) {
        await client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);
        return;
    }

    const formats = result;

    if (formats.length === 0) {
        // Send a default option when no qualities are available
        const noQualitiesMessage = `No specific qualities are available for this video.\n\nReply with:\n1. Default Quality (best)`;

        await client.reply(m.chat, noQualitiesMessage, m);
        // Save the mapping for default quality
        global.userSessions[m.chat] = { url, formats: [{ id: "best", label: "Default Quality" }] };
    } else {
        // Display qualities with numbered options
        let qualityMessage = "Select a quality to download by replying with the corresponding number:\n";

        formats.forEach((format, index) => {
            qualityMessage += `${index + 1}. ${format.label} (${format.size})\n`;
        });

        qualityMessage += `\nReply with a number (e.g., 1).`;

        await client.reply(m.chat, qualityMessage, m);
        // Save the mapping for the user
        global.userSessions[m.chat] = { url, formats };
    }
}

// Function to handle numeric input for selecting and downloading a quality
async function handleQualitySelection(m, { client, text, isPrefix }) {
    const session = global.userSessions[m.chat];
    
    // Check if the session exists
    if (!session || !session.formats) {
        await client.reply(m.chat, `No ongoing session found. Please search for a video first using "${isPrefix}ytdl <url>".`, m);
        return;
    }

    const userChoice = parseInt(text.trim(), 10);
    if (isNaN(userChoice) || userChoice < 1 || userChoice > session.formats.length) {
        await client.reply(m.chat, `Invalid choice. Please reply with a number between 1 and ${session.formats.length}.`, m);
        return;
    }

    // Fetch the selected format based on the number
    const selectedFormat = session.formats[userChoice - 1];
    const qualityId = selectedFormat.id;

    // Log the selected format for debugging
    console.log(`Selected format: ${selectedFormat.label} - ${selectedFormat.size}`);

    // Proceed with downloading the video
    const downloadCommand = `${isPrefix}cvbi ${session.url} ${qualityId}`;
    await client.reply(m.chat, `Downloading video in quality: ${selectedFormat.label}...`, m);

    // Simulate or trigger the download (replace this with your actual download logic)
    await client.reply(m.chat, `Download completed for: ${selectedFormat.label}`, m);
}

// Main exportable handler for the bot
exports.run = {
    usage: ['ytdl'],
    use: 'url',
    category: 'special',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (text.match(/^\d+$/)) {
                // Handle numeric quality selection
                await handleQualitySelection(m, { client, text, isPrefix });
            } else {
                // Handle initial URL input
                await handleUserRequest(m, { client, text, isPrefix, command, Func });
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
