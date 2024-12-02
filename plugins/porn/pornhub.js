const { PornHub } = require('pornhub.js'); // Import the PornHub class
const pornhub = new PornHub(); // Create an instance of the PornHub class
const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Initialize global sessions if they don't exist
if (!global.pornHubSessions) global.pornHubSessions = {};
if (!global.videoSessions) global.videoSessions = {};

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

// Function to handle the /pornhub command (Search videos)
async function handlePornHubRequest(m, { client, text, isPrefix, command, Func }) {
    if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'step mom'), m);

    client.sendReact(m.chat, '🕒', m.key);

    // Fetch search results from PornHub API
    const result = await pornhub.searchVideo(text);

    if (!result.data || result.data.length === 0) {
        return client.reply(m.chat, 'No results found.', m);
    }

    // Prepare the result in a similar format to the XHamster example
    global.pornHubSessions[m.chat] = { data: result.data };

    // Prepare the list of results
    let resultMessage = "*🎬 P O R N H U B   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video from the list below. Reply with `/getpornhub <number>` to select a video.\n\n";
    result.data.forEach((v, index) => {
        resultMessage += `*${index + 1}*: ${v.title}\n\n`;
    });

    await client.reply(m.chat, resultMessage, m);
}

// Function to handle the /getpornhub command (Fetch and list qualities)
async function handleGetPornHubCommand(m, { client, text }) {
    const index = parseInt(text.trim(), 10) - 1;
    const session = global.pornHubSessions[m.chat];

    // Validate session and selection
    if (!session || !session.data || !session.data[index]) {
        return client.reply(m.chat, "❌ Invalid selection. Please select a valid video from the list.", m);
    }

    const selectedVideo = session.data[index];
    const url = selectedVideo.url;
    const result = await fetchQualities(url);

    if (result.error) return client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);

    const formats = result;
    if (formats.length === 0) {
        return client.reply(m.chat, "❌ No qualities found. Please use `/getytdl 1` to download with the default quality.", m);
    }

    // Store session data for later use with 2-minute timeout
    global.videoSessions[m.chat] = {
        url,
        formats,
        timeout: setTimeout(() => {
            delete global.videoSessions[m.chat]; // Delete session after timeout
        }, 120000) // 2 minutes
    };

    // Send the quality options to the user, including default option
    let qualityMessage = "*🎬 Quality Selector*\n\n";
    qualityMessage += `*Please select a quality for the video.*\n\n`;

    // Add the default quality option at the top
    const defaultIndex = formats.length;  // The last quality in the list will be default
    qualityMessage += `*${defaultIndex + 1}**️⃣ - Default Quality (choose this if you want the default)\n\n`;

    formats.forEach((format, index) => {
        qualityMessage += `*${index + 1}**️⃣ - ${format.label}\n`;
        qualityMessage += `  📦 *Size*: ${format.size ? format.size : "Not available"}\n`;
        qualityMessage += `  🖥️ *Type*: ${format.container}\n\n`;
    });

    qualityMessage += `💡 To select a quality, reply with \`/getytdl <number>\` (e.g., \`/getytdl 1\`).\n`;
    qualityMessage += `⏳ You have 2 minutes to select a quality. If no choice is made, the download will not proceed.`;

    client.reply(m.chat, qualityMessage, m);
}

// Function to handle the /getytdl command (Fetch and execute download)
async function handleGetYtdlCommand(m, { client, text }) {
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "❌ No active session. Please start with the /pornhub command first.", m);
    }

    let choice = text.trim();

    // Validate the quality selection (ensure it's a number and within the correct range)
    if (choice === '') {
        return client.reply(m.chat, "❌ You must select a quality. Use `/getytdl <number>` to choose.", m);
    }

    const qualityIndex = parseInt(choice, 10) - 1;

    // If 'default' is selected, set to the last available quality
    if (choice.toLowerCase() === 'default' || qualityIndex === session.formats.length) {
        return client.reply(m.chat, "❌ You must explicitly select a valid quality number, not 'default'.", m);
    }

    if (isNaN(qualityIndex) || qualityIndex < 0 || qualityIndex >= session.formats.length) {
        return client.reply(m.chat, "⚠️ Invalid choice. Please reply with a valid number between 1 and " + session.formats.length + ".", m);
    }

    const selectedFormat = session.formats[qualityIndex];
    const downloadUrl = session.url;
    const quality = selectedFormat.id;

    // Execute the download command
    execDownloadCommand(m, client, downloadUrl, quality);
}

// Function to execute the download command
async function execDownloadCommand(m, client, url, quality) {
    const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download
    const scriptPath = path.resolve(__dirname, 'downloader.py'); // Path to Python download script

    try {
        // Call the Python script to start downloading
        const command = `python3 ${scriptPath} --url "${url}" --quality "${quality}" --output "${outputDir}"`;
        const { stdout, stderr } = await execPromise(command);

        if (stderr) throw new Error(stderr);

        client.reply(m.chat, "Download started successfully! 📥", m);
    } catch (error) {
        console.error(`Error executing download command: ${error.message}`);
        client.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
}
