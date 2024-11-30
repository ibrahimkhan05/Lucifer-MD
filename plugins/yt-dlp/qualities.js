const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Function to fetch video qualities using Python script
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

// Function to handle user request for fetching qualities and starting the session
async function handleUserRequest(m, { client, text, isPrefix, command }) {
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
        // If no specific qualities are available, send default quality download option
        const noQualitiesMessage = `No specific qualities are available for this video.\n\nYou can download the default quality video by clicking below:`;
        await client.reply(m.chat, noQualitiesMessage, m);

        // Add the option for default quality
        await sendDefaultQualityButton(url, client, m);
    } else {
        // Display available qualities with carousel buttons
        let qualityMessage = "Select a quality to download by clicking the corresponding button:";

        const cards = formats.map((format, index) => ({
            header: {
                imageMessage: global.db.setting.cover, // Set the image for the card header
                hasMediaAttachment: true,
            },
            body: {
                text: `${format.label} (${format.size})`, // Video quality and size
            },
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: format.label,
                        id: `/cvbi ${url} ${format.id}` // Trigger download with the selected quality
                    })
                }]
            }
        }));

        // Send carousel with the available video qualities as buttons
        await client.sendCarousel(m.chat, cards, m, {
            content: qualityMessage
        });
    }
}

// Function to send the default quality button
async function sendDefaultQualityButton(url, client, m) {
    const buttonMessage = {
        header: {
            imageMessage: global.db.setting.cover, // Set the image for the card header
            hasMediaAttachment: true,
        },
        body: {
            text: `Download the video in default quality (best available).`,
        },
        nativeFlowMessage: {
            buttons: [{
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Download Default Quality",
                    id: `/cvbi ${url}` // Trigger download with default quality
                })
            }]
        }
    };

    // Send button for default quality download
    await client.sendCarousel(m.chat, [buttonMessage], m, {
        content: "Click below to download the video in default quality."
    });
}

// Main exportable handler for the bot
exports.run = {
    usage: ['ytdl'],
    use: 'url',
    category: 'special',
    async: async (m, { client, text, isPrefix, command }) => {
        try {
            // Handle the user request for video quality selection
            await handleUserRequest(m, { client, text, isPrefix, command });
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
