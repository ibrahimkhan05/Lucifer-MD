const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios'); // For HTTP request to check file size

exports.run = {
    usage: ['aria2'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);

        const url = args[0]; // Get URL from args
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download
        const scriptPath = path.resolve(__dirname, 'aria2_downloader.py'); // Path to Python script

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        try {
            // Get file size of the URL
            const response = await axios.head(url);
            const fileSize = parseInt(response.headers['content-length']); // Content-Length is in bytes
            const fileSizeMB = fileSize / (1024 * 1024); // Convert to MB

            if (fileSizeMB > 930) { // Check if file size exceeds 930 MB
                await client.reply(m.chat, `💀 The file size (${fileSizeMB.toFixed(2)} MB) exceeds the maximum limit of 930 MB`, m);
                return;
            }

            // Notify user that the download is starting
            await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

            exec(`python3 ${scriptPath} ${url} ${outputDir}`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error.message}`);
                    await client.reply(m.chat, `Error downloading file: ${error.message}`, m);
                    return;
                }

                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    await client.reply(m.chat, `Error downloading file: ${stderr}`, m);
                    return;
                }

                console.log(`stdout: ${stdout}`);

                // Parse the stdout to get the file details
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

                    if (fileSize > 930 * 1024 * 1024) { // 930MB size limit
                        await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 930MB`, m);
                        fs.unlinkSync(filePath); // Delete the file
                        return;
                    }

                    const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
                    const chSize = Func.sizeLimit(fileSize.toString(), maxUpload.toString());

                    if (chSize.oversize) {
                        await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit`, m);
                        fs.unlinkSync(filePath); // Delete the file
                        return;
                    }

                    await client.reply(m.chat, `Your file (${fileSizeStr}) is being uploaded.`, m);

                    const extname = path.extname(fileName).toLowerCase();
                    const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
                    const isDocument = isVideo && fileSize / (1024 * 1024) > 99; // 99 MB threshold

                    await client.sendFile(m.chat, filePath, fileName, '', m, { document: isDocument });

                    fs.unlinkSync(filePath); // Delete the file after sending
                } catch (parseError) {
                    console.error(`Error handling file: ${parseError.message}`);
                    await client.reply(m.chat, `Error handling file: ${parseError.message}`, m);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete on error
                }
            });
        } catch (err) {
            console.error('Error fetching file size:', err);
            await client.reply(m.chat, `Error fetching file size: ${err.message}`, m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
