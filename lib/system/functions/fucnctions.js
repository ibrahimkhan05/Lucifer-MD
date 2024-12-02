const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execPromise = promisify(exec);

const scriptPathFetch = path.resolve(__dirname, 'fetch_qualities.py');
const scriptPathDownload = path.resolve(__dirname, 'downloader.py');
const outputDir = path.resolve(__dirname, 'downloads');

// Global session storage
global.videoSessions = {}; 

async function processDownload(url, client, m) {
    // Fetch available qualities
    const commandFetch = `python3 ${scriptPathFetch} ${url}`;
    try {
        const { stdout, stderr } = await execPromise(commandFetch, { shell: true });
        if (stderr) throw new Error(stderr);

        const result = JSON.parse(stdout);
        if (Array.isArray(result)) {
            // Store session data for 2 minutes
            global.videoSessions[m.chat] = {
                url,
                formats: result,
                timeout: setTimeout(() => {
                    delete global.videoSessions[m.chat];
                }, 120000)
            };

            let qualityMessage = "*🎬 Quality Selector*\n\n";
            result.forEach((format, index) => {
                qualityMessage += `*${index + 1}**️⃣ - ${format.label}\n`;
                qualityMessage += `  📦 *Size*: ${format.size || "Not available"}\n`;
                qualityMessage += `  🖥️ *Type*: ${format.container}\n\n`;
            });

            qualityMessage += `💡 To select a quality, reply with \`/getytdl <number>\`. You have 2 minutes to select.`;
            client.reply(m.chat, qualityMessage, m);
        } else {
            throw new Error('Unexpected response format from fetch_qualities.py');
        }
    } catch (error) {
        console.error(`Error fetching qualities: ${error.message}`);
        client.reply(m.chat, `❌ Error fetching qualities: ${error.message}`, m);
        return;
    }

    // Handle user selection for quality and download
    client.on('message', async (msg) => {
        if (msg.body.startsWith('/getytdl')) {
            const session = global.videoSessions[m.chat];
            if (!session) {
                return client.reply(m.chat, "❌ No active session. Please start with /ytdl command first.", m);
            }

            const choice = parseInt(msg.body.split(' ')[1], 10);
            if (isNaN(choice) || choice < 1 || choice > session.formats.length) {
                return client.reply(m.chat, "⚠️ Invalid choice. Please reply with a valid number.", m);
            }

            const selectedFormat = session.formats[choice - 1];
            const quality = selectedFormat.id;

            await downloadVideo(url, quality, client, m);
        }
    });
}

// Handle download of the video
async function downloadVideo(url, quality, client, m) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    await client.reply(m.chat, 'Your file is being downloaded. This may take some time...', m);

    exec(`python3 ${scriptPathDownload} ${url} ${outputDir} ${quality}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Download exec error: ${error.message}`);
            await client.reply(m.chat, `❌ Error downloading video: ${error.message}`, m);
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            await client.reply(m.chat, `❌ Error downloading video: ${stderr}`, m);
            return;
        }

        const output = JSON.parse(stdout.trim());
        if (output.error) {
            await client.reply(m.chat, `❌ Download failed: ${output.message}`, m);
            return;
        }

        const filePath = output.filePath;
        const fileName = path.basename(filePath);

        try {
            const fileSize = fs.statSync(filePath).size;
            const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

            if (fileSize > 930 * 1024 * 1024) { // Limit size to 930MB
                await client.reply(m.chat, `❌ File size (${fileSizeStr}) exceeds the limit.`, m);
                fs.unlinkSync(filePath);
                return;
            }

            await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

            const extname = path.extname(fileName).toLowerCase();
            const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
            const isDocument = isVideo && fileSize / (1024 * 1024) > 99;

            await client.sendFile(m.chat, filePath, fileName, '', m, { document: isDocument });

            delete global.videoSessions[m.chat];
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error(`Error handling file: ${err.message}`);
            await client.reply(m.chat, `❌ Error handling file: ${err.message}`, m);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    });
}

// To call the function in your script, use:
// processDownload(url, client, m);

module.exports = { processDownload };
