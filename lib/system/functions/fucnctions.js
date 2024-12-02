const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Global storage for video sessions
global.videoSessions = {};

// Function to handle the full process: fetch qualities, select quality, download, and send the file
async function handleVideoDownload(m, client, url, quality = 'default') {
    const outputDir = path.resolve(__dirname, 'downloads');
    const scriptPath = path.resolve(__dirname, 'fetch_qualities.py'); // Path to fetch_qualities.py
    const downloaderScriptPath = path.resolve(__dirname, 'downloader.py'); // Path to downloader.py

    // Fetch video qualities
    try {
        const command = `python3 ${scriptPath} ${url}`;
        const { stdout, stderr } = await execPromise(command, { shell: true });

        if (stderr) throw new Error(stderr);

        const result = JSON.parse(stdout);
        if (Array.isArray(result)) {
            // Store session for the user
            global.videoSessions[m.chat] = {
                url,
                formats: result,
                timeout: setTimeout(() => {
                    delete global.videoSessions[m.chat];
                }, 120000) // 2 minutes
            };

            let qualityMessage = "*🎬 Quality Selector*\n\n";
            result.forEach((format, index) => {
                qualityMessage += `*${index + 1}**️⃣ - ${format.label}\n`;
                qualityMessage += `  📦 *Size*: ${format.size ? format.size : "Not available"}\n`;
                qualityMessage += `  🖥️ *Type*: ${format.container}\n`;
                qualityMessage += `\n`;  // Space between entries
            });

            qualityMessage += `💡 To select a quality, reply with \`/getytdl <number>\` (e.g., \`/getytdl 1\`).\n`;
            qualityMessage += `⏳ You have 2 minutes to select a quality. Default quality will be used if no choice is made.`;
            return client.reply(m.chat, qualityMessage, m);

        } else if (result.error) {
            throw new Error(result.error);
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        return client.reply(m.chat, `Error fetching qualities: ${error.message}`, m);
    }

    // If a session exists for the user (i.e., after user selects quality)
    const session = global.videoSessions[m.chat];
    if (!session) {
        return client.reply(m.chat, "❌ No active session. Please start with the URL command first.", m);
    }

    // Handle quality selection
    let selectedQuality = quality.toLowerCase();
    if (selectedQuality === 'default') {
        selectedQuality = 1; // Default to first option if no valid choice
    } else {
        selectedQuality = parseInt(selectedQuality, 10);
    }

    if (isNaN(selectedQuality) || selectedQuality < 1 || selectedQuality > session.formats.length) {
        return client.reply(m.chat, "⚠️ Invalid choice. Please reply with a valid number between 1 and 9, or type 'default'.", m);
    }

    const selectedFormat = session.formats[selectedQuality - 1];

    // Execute the download process
    try {
        await client.reply(m.chat, 'Your file is being downloaded. This may take some time...', m);

        exec(`python3 ${downloaderScriptPath} ${url} ${outputDir} ${selectedFormat.id}`, async (error, stdout, stderr) => {
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

            const output = JSON.parse(stdout.trim());
            if (output.error) {
                await client.reply(m.chat, `Download failed: ${output.message}`, m);
                return;
            }

            const filePath = output.filePath; // Full path to the downloaded file
            const fileName = path.basename(filePath); // Extract file name from path

            // Handle file size and send the file
            try {
                const fileSize = fs.statSync(filePath).size;
                const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

                if (fileSize > 930 * 1024 * 1024) { // Check for file size > 930MB
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 930MB`, m);
                    fs.unlinkSync(filePath); // Delete the file
                    return;
                }

                await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

                const extname = path.extname(fileName).toLowerCase();
                const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
                const isDocument = isVideo && fileSize / (1024 * 1024) > 99; // 99 MB threshold

                await client.sendFile(m.chat, filePath, fileName, '', m, { document: isDocument });

                // Clean up: delete the file after sending
                delete global.videoSessions[m.chat];
                fs.unlinkSync(filePath); // Delete the file after sending
            } catch (parseError) {
                console.error(`Error handling file: ${parseError.message}`);
                await client.reply(m.chat, `Error handling file: ${parseError.message}`, m);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete on error
            }
        });
    } catch (e) {
        console.error('Error in download process:', e);
        await client.reply(m.chat, "❌ An error occurred. Please try again later.", m);
    }
}

// Example of usage in the bot
module.exports = {
    handleVideoDownload
};
