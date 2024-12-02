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

// Function to execute the download
async function execDownload(m, client, selectedQuality) {
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "❌ No active session. Please start with the /ytdl command first.", m);
    }

    const formats = session.formats;
    if (isNaN(selectedQuality) || selectedQuality < 1 || selectedQuality > formats.length) {
        return client.reply(m.chat, "⚠️ Invalid choice. Please select a valid number between 1 and " + formats.length + ".", m);
    }

    const selectedFormat = formats[selectedQuality - 1];
    const downloadUrl = session.url;
    const quality = selectedFormat.id;

    // Notify user that download is starting
    await client.reply(m.chat, 'Your file is being downloaded. Please wait...', m);

    const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save download
    const scriptPath = path.resolve(__dirname, 'downloader.py'); // Path to Python script

    // Ensure downloads directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    exec(`python3 ${scriptPath} ${downloadUrl} ${outputDir} ${quality}`, async (error, stdout, stderr) => {
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

            if (fileSize > 930 * 1024 * 1024) { // 930MB limit
                await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 930MB`, m);
                fs.unlinkSync(filePath); // Delete the file after exceeding size
                return;
            }

            await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

            const extname = path.extname(fileName).toLowerCase();
            const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
            const isDocument = isVideo && fileSize / (1024 * 1024) > 99; // 99MB threshold for document

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

// Main function that can be used anywhere
async function handleYtdlDownload(m, { client, text, isPrefix, command }) {
    if (!text) return client.reply(m.chat, `Usage: ${isPrefix}${command} <url>`, m);

    const url = text.trim();
    const result = await fetchQualities(url);

    if (result.error) return client.reply(m.chat, `Error fetching qualities: ${result.error}`, m);

    const formats = result;
    if (formats.length === 0) return client.reply(m.chat, "❌ No qualities found. Please try another video.", m);

    // Store session data for later use with a 2-minute timeout
    global.videoSessions[m.chat] = {
        url,
        formats,
        timeout: setTimeout(() => {
            delete global.videoSessions[m.chat]; // Delete session after timeout
        }, 120000) // 2 minutes
    };

    // Stylish quality selection menu
    let qualityMessage = "*🎬 Quality Selector*\n\n";

    formats.forEach((format, index) => {
        qualityMessage += `*${index + 1}**️⃣ - ${format.label}\n`;
        qualityMessage += `  📦 *Size*: ${format.size ? format.size : "Not available"}\n`;
        qualityMessage += `  🖥️ *Type*: ${format.container}\n`;
        qualityMessage += `\n`;  // Add space between entries
    });

    qualityMessage += `💡 To select a quality, reply with \`/getytdl <number>\` (e.g., \`/getytdl 1\`).\n`;
    qualityMessage += `⏳ You have 2 minutes to select a quality. Default quality will be used if no choice is made.`;

    client.reply(m.chat, qualityMessage, m);
}

// Export the function to use elsewhere
module.exports = handleYtdlDownload;