const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Initialize global sessions if they don't exist
if (!global.redTubeSessions) global.redTubeSessions = {};
if (!global.videoSessions) global.videoSessions = {};

// Function to fetch RedTube search results
async function fetchRedTubeSearchResults(query) {
    const url = `https://lust.scathach.id/redtube/search?key=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const result = await response.json();
        if (!result.success || !result.data || result.data.length === 0) {
            throw new Error("No results found.");
        }
        return result.data;
    } catch (error) {
        console.error(`Error fetching RedTube search results: ${error.message}`);
        return { error: error.message };
    }
}

// Function to handle the /redtube command (Search videos)
async function handleRedTubeRequest(m, { client, text, isPrefix, command, Func }) {
    if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'milf'), m);

    client.sendReact(m.chat, '🕒', m.key);

    // Fetch search results from RedTube API
    const result = await fetchRedTubeSearchResults(text);

    if (result.error) {
        return client.reply(m.chat, `Error: ${result.error}`, m);
    }

    global.redTubeSessions[m.chat] = { data: result };

    // Prepare the list of results
    let resultMessage = "*🎬 R E D T U B E   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video from the list below. Reply with `/getredtube <number>` to select a video.\n\n";
    result.forEach((v, index) => {
        resultMessage += `*${index + 1}*: ${v.title}\n`;
        resultMessage += `  ⏱️ *Duration*: ${v.duration}\n`;
        resultMessage += `  👀 *Views*: ${v.views}\n\n`;
    });

    await client.reply(m.chat, resultMessage, m);
}

// Function to handle the /getredtube command (Fetch and list qualities)
async function handleGetRedTubeCommand(m, { client, text }) {
    const index = parseInt(text.trim(), 10) - 1;
    const session = global.redTubeSessions[m.chat];

    // Validate session and selection
    if (!session || !session.data || !session.data[index]) {
        return client.reply(m.chat, "❌ Invalid selection. Please select a valid video from the list.", m);
    }

    const selectedVideo = session.data[index];
    const url = selectedVideo.link;
    
    // Now, assuming you have a function similar to fetchQualities that can fetch video details for RedTube (not implemented here)
    const result = await fetchQualitiesRedTube(url); 

    if (result.error) return client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);

    const formats = result;
    if (formats.length === 0) {
        // If no qualities found, send a message instructing to use default download
        return client.reply(m.chat, "❌ No qualities found. To download with the default quality, type `/redtube 1`.", m);
    }

    // Store session data for later use with 2-minute timeout
    global.videoSessions[m.chat] = {
        url,
        formats,
        timeout: setTimeout(() => {
            delete global.videoSessions[m.chat]; // Automatically delete session after 2 minutes
        }, 120000) // 2 minutes
    };

    // Stylish quality selection menu
    let qualityMessage = "*🎬 Quality Selector*\n\n";
    qualityMessage += `*Please select a quality for the video.*\n\n`;
    formats.forEach((format, index) => {
        qualityMessage += `*${index + 1}**️⃣ - ${format.label}\n`;
        qualityMessage += `  📦 *Size*: ${format.size ? format.size : "Not available"}\n`;
        qualityMessage += `  🖥️ *Type*: ${format.container}\n\n`;
    });

    qualityMessage += `💡 To select a quality, reply with \`/getytdl <number>\` (e.g., \`/getytdl 1\`).\n`;
    qualityMessage += `⏳ You have 2 minutes to select a quality. The session will expire if no choice is made.`;

    client.reply(m.chat, qualityMessage, m);
}

// Function to handle the /getytdl command (Fetch and execute download)
async function handleGetYtdlCommand(m, { client, text }) {
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "❌ No active session. Please start with /redtube command first.", m);
    }

    // Handle default quality or user choice
    let choice = text.trim().toLowerCase();

    if (choice === 'default') {
        choice = 1; // Use the first quality as default if no choice is made
    } else {
        choice = parseInt(choice, 10);
    }

    if (isNaN(choice) || choice < 1 || choice > session.formats.length) {
        return client.reply(m.chat, "⚠️ Invalid choice. Please reply with a valid number between 1 and 9, or type 'default'.", m);
    }

    const selectedFormat = session.formats[choice - 1];
    const downloadUrl = session.url;
    const quality = selectedFormat.id;

    // Execute the download command
    execDownloadCommand(m, client, downloadUrl, quality);
}

// Function to execute the download command (same as before)
async function execDownloadCommand(m, client, url, quality) {
    const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download
    const scriptPath = path.resolve(__dirname, 'downloader.py'); // Path to Python script

    // Ensure the downloads directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Notify user that the download is starting
    await client.reply(m.chat, 'Your file is being downloaded. This may take some time...', m);

    exec(`python3 ${scriptPath} ${url} ${outputDir} ${quality}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error.message}`);
            await client.reply(m.chat, `Error downloading video: ${error.message}`, m);
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            await client.reply(m.chat, `Error downloading video: ${stderr}`, m);
            return;
        }

        console.log(`stdout: ${stdout}`);

        // Parse the stdout to get the original file name and path
        const output = JSON.parse(stdout.trim());
        if (output.error) {
            await client.reply(m.chat, `Download failed: ${output.message}`, m);
            return;
        }

        const filePath = output.filePath; // The full path to the downloaded file
        const fileName = path.basename(filePath); // Extract file name from path

        // Handle file and send to user
        try {
            const fileSize = fs.statSync(filePath).size;
            const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

            if (fileSize > 930 * 1024 * 1024) { // 930MB
                await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 930MB`, m);
                fs.unlinkSync(filePath); // Delete the file
                return;
            }

            await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

            const extname = path.extname(fileName).toLowerCase();
            const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
            const isDocument = isVideo && fileSize / (1024 * 1024) > 99; // 99 MB threshold

            await client.sendFile(m.chat, filePath, fileName, '', m, { document: isDocument });

            // Delete session after sending the file
            delete global.videoSessions[m.chat];
            fs.unlinkSync(filePath); // Delete the file after sending
        } catch (parseError) {
            console.error(`Error handling file: ${parseError.message}`);
            await client.reply(m.chat, `Error handling file: ${parseError.message}`, m);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete on error
        }
    });
}

// Main exportable handler for RedTube
exports.run = {
    usage: ['redtube'],
    hidden: ['getredtube'],
    use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
    category: 'porn',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (command === 'redtube') {
                await handleRedTubeRequest(m, { client, text, isPrefix, command, Func });
            } else if (command === 'getredtube') {
                await handleGetRedTubeCommand(m, { client, text });
            } else if (command === 'getytdl') {
                await handleGetYtdlCommand(m, { client, text });
            }
        } catch (error) {
            console.error(`Error in command execution: ${error.message}`);
        }
    }
};
