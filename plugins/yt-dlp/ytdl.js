const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

exports.run = {
    usage: ['cvbi'],
    use: 'url [quality]',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);

        const url = args[0];
        const formatId = args[1];
        const outputDir = path.resolve(__dirname, 'downloads');
        const scriptPath = path.resolve(__dirname, 'downloader.py');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const downloadMsg = await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);
        const escapedUrl = url.replace(/(["\s'$`\\])/g, '\\$1');
        
        let commandStr = `python3 "${scriptPath}" "${escapedUrl}" "${outputDir}"`;
        if (formatId) {
            commandStr += ` "${formatId}"`;
        }

        console.log(`Executing command: ${commandStr}`);
        
        exec(commandStr, { maxBuffer: 10 * 1024 * 1024 }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error.message}`);
                await client.reply(m.chat, `Error downloading video: ${error.message}`, m);
                return;
            }

            const cleanedOutput = stdout.trim();
            console.log(`Python clean output: ${cleanedOutput}`);
            if (stderr) console.error(`Python stderr: ${stderr}`);

            let output;
            try {
                const jsonMatch = cleanedOutput.match(/(\{.*\})/);
                const jsonStr = jsonMatch ? jsonMatch[0] : cleanedOutput;
                output = JSON.parse(jsonStr);
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError.message}, Raw output: ${cleanedOutput}`);
                await client.reply(m.chat, `Download failed. The source might be restricted or unavailable.`, m);
                return;
            }

            if (output.error) {
                await client.reply(m.chat, `Download failed: ${output.message || output.error}`, m);
                return;
            }

            if (!output.filePath) {
                await client.reply(m.chat, `Download failed: No file path returned from downloader`, m);
                return;
            }

            const filePath = output.filePath;
            try {
                if (!fs.existsSync(filePath)) {
                    await client.reply(m.chat, `Download failed: File not found after download`, m);
                    return;
                }

                const fileName = path.basename(filePath);
                const fileStats = fs.statSync(filePath);
                const fileSize = fileStats.size;
                const fileSizeMB = fileSize / (1024 * 1024);
                const fileSizeStr = `${fileSizeMB.toFixed(2)} MB`;

                if (fileSize > 1980 * 1024 * 1024) {
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 2GB`, m);
                    fs.unlinkSync(filePath);
                    return;
                }

                const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
                const chSize = Func.sizeLimit(fileSize.toString(), maxUpload.toString());

                if (chSize.oversize) {
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit`, m);
                    fs.unlinkSync(filePath);
                    return;
                }

                await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

                const extname = path.extname(fileName).toLowerCase();
                const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);

                if (isVideo && fileSizeMB > 99) {
                    // Send as document if video > 99MB
                    await client.sendFile(m.chat, filePath, fileName, '', m, { document: true });
                } else if (isVideo) {
                    // Send as video message
                    await client.sendMessage(m.chat, {
                        video: fs.readFileSync(filePath),
                        mimetype: 'video/mp4',
                        fileName,
                        caption: `🎬 ${fileName} (${fileSizeStr})`
                    }, { quoted: m });
                } else {
                    // Fallback: send non-video files as documents
                    await client.sendFile(m.chat, filePath, fileName, '', m, { document: true });
                }

                // Delete the file after sending
                setTimeout(() => {
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`Deleted file: ${filePath}`);
                        }
                    } catch (deleteError) {
                        console.error(`Error deleting file: ${deleteError.message}`);
                    }
                }, 5000);
            } catch (fileError) {
                console.error(`Error handling file: ${fileError.message}`);
                await client.reply(m.chat, `Error handling file: ${fileError.message}`, m);
                try {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (deleteError) {
                    console.error(`Error deleting file: ${deleteError.message}`);
                }
            }
        });
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
