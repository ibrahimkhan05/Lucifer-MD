const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');

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

        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const downloadMsg = await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

        const escapedUrl = url.replace(/(["\s'$`\\])/g, '\\$1');
        let commandStr = `python3 "${scriptPath}" "${escapedUrl}" "${outputDir}"`;
        if (formatId) commandStr += ` "${formatId}"`;

        exec(commandStr, { maxBuffer: 10 * 1024 * 1024 }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error.message}`);
                await client.reply(m.chat, `Error downloading video: ${error.message}`, m);
                return;
            }

            const cleanedOutput = stdout.trim();
            let output;
            try {
                const jsonMatch = cleanedOutput.match(/(\{.*\})/);
                const jsonStr = jsonMatch ? jsonMatch[0] : cleanedOutput;
                output = JSON.parse(jsonStr);
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError.message}`);
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

            let filePath = output.filePath;
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

            await client.reply(m.chat, `Your file (${fileSizeStr}) is being prepared for upload.`, m);

            const fileName = path.basename(filePath);
            const extname = path.extname(fileName).toLowerCase();
            const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
            const isDocument = isVideo && fileSizeMB > 99;

            // ✅ RE-ENCODE if it's a video over 99MB to fix missing video on WhatsApp
            if (isVideo && fileSizeMB > 99) {
                const fixedPath = filePath.replace(/\.mp4$/, '_fixed.mp4');
                try {
                    execSync(`ffmpeg -i "${filePath}" -c:v libx264 -preset fast -c:a aac -b:a 128k -movflags +faststart "${fixedPath}"`);
                    fs.unlinkSync(filePath);
                    filePath = fixedPath;
                } catch (err) {
                    console.error('FFmpeg re-encode error:', err.message);
                    await client.reply(m.chat, `Re-encoding failed: ${err.message}`, m);
                    return;
                }
            }

            // Upload file
            try {
                await client.sendFile(m.chat, filePath, path.basename(filePath), '', m, { document: isDocument });

                setTimeout(() => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted file: ${filePath}`);
                    }
                }, 5000);
            } catch (fileError) {
                console.error(`Error sending file: ${fileError.message}`);
                await client.reply(m.chat, `Error sending file: ${fileError.message}`, m);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
