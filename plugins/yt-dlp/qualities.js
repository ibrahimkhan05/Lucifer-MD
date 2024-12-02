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
    const totalQualities = formats.length;

    // Default quality is always the next index after available qualities
    const defaultIndex = totalQualities + 1;

    // If no qualities are found, treat the first option as default
    if (totalQualities === 0) {
        global.videoSessions[m.chat] = {
            url,
            formats: [],
            defaultIndex: 1,
            timeout: setTimeout(() => {
                delete global.videoSessions[m.chat]; // Just delete the session when it expires
            }, 120000) // 2 minutes
        };

        // Directly inform the user about the default quality (option 1)
        return client.reply(m.chat, "*❌ No qualities found. Downloading with default quality (option 1)...*", m);
    }

    // Store session data for later use with a 2-minute timeout
    global.videoSessions[m.chat] = {
        url,
        formats,
        defaultIndex,
        timeout: setTimeout(() => {
            delete global.videoSessions[m.chat]; // Just delete the session when it expires
        }, 120000) // 2 minutes
    };

    // Stylish quality selection menu with formatted output
    let qualityMessage = "*🎬 Quality Selector*\n\n";

    formats.forEach((format, index) => {
        qualityMessage += `*${index + 1}**️⃣ - ${format.label}\n`;
        qualityMessage += `  📦 *Size*: ${format.size ? format.size : "Not available"}\n`;
        qualityMessage += `  🖥️ *Type*: ${format.container}\n`;
        qualityMessage += `\n`;  // Add some space between entries
    });

    // Add default quality as the next option
    qualityMessage += `*${defaultIndex}**️⃣ - Default Quality (choose this if you want the default)\n`;
    qualityMessage += `💡 To select a quality, reply with \`/getytdl <number>\` (e.g., \`/getytdl 1\`).\n`;
    qualityMessage += `⏳ You must choose the default quality or one of the available options.`;

    client.reply(m.chat, qualityMessage, m);
}

// Function to handle /getytdl command (Execute download)
async function handleGetYtdlCommand(m, { client, text }) {
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "❌ No active session. Please start with /ytdl command first.", m);
    }

    let choice = text.trim();

    // If no qualities found, treat /getytdl 1 as download for the default quality
    if (session.formats.length === 0 && choice === '1') {
        choice = 1;  // Force choice to 1 as the default
    }

    // Ensure user provides a valid number, and that it matches a valid option
    if (isNaN(choice) || choice < 1 || choice > session.formats.length + 1) {
        return client.reply(m.chat, "⚠️ Invalid choice. Please reply with a valid number between 1 and " + (session.formats.length + 1) + ".", m);
    }

    // If the user selects the default index
    if (choice == session.defaultIndex) {
        choice = session.defaultIndex;
    } else {
        choice = parseInt(choice, 10);
    }

    const selectedFormat = session.formats[choice - 1];
    const downloadUrl = session.url;
    const quality = selectedFormat ? selectedFormat.id : "default"; // Fallback to default if no format is selected

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
