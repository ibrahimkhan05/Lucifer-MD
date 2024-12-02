const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execPromise = promisify(exec);

global.videoSessions = {}; // Global storage for video sessions

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

// Function to handle the /ytdl command (Fetch and list qualities)
async function handleUserRequest(m, { client, text, isPrefix, command }) {
    if (!text) return client.reply(m.chat, `Usage: ${isPrefix}${command} <url>`, m);

    const url = text.trim();
    const result = await fetchQualities(url);

    if (result.error) return client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);

    const formats = result;
    if (formats.length === 0) return client.reply(m.chat, "❌ No qualities found. Please try another video.", m);

    // Store session data for later use
    global.videoSessions[m.chat] = {
        url,
        formats,
        timeout: setTimeout(() => {
            delete global.videoSessions[m.chat];
            client.reply(m.chat, "⏰ Session expired. Please start again with the /ytdl command.", m);
        }, 300000) // 5 minutes
    };

    // Stylish quality selection menu
    let qualityMessage = "🎥 *Select a quality by replying with the corresponding number or type 'default' for the best quality:* \n\n";
    formats.forEach((format, index) => {
        qualityMessage += `*${index + 1}*️⃣ - ${format.label} ${format.size ? `(${format.size})` : ''}\n`;
    });

    qualityMessage += `\n💡 Default quality will be used if no choice is made.`;

    client.reply(m.chat, qualityMessage, m);
}

// Function to handle /getytdl command (Execute download)
async function handleGetYtdlCommand(m, { client, text }) {
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "❌ No active session. Please start with /ytdl command first.", m);
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

// Function to execute the /cvbi download command
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

            fs.unlinkSync(filePath); // Delete the file after sending

            // Delete session after the file is sent
            delete global.videoSessions[m.chat];

        } catch (parseError) {
            console.error(`Error handling file: ${parseError.message}`);
            await client.reply(m.chat, `Error handling file: ${parseError.message}`, m);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete on error
        }
    });
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
