const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

exports.run = {
    usage: ['cvbi'],
    use: 'url [quality]',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);

        const url = args[0]; // URL provided by the user
        const quality = args[1]; // Get quality from args if provided
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download
        const scriptPath = path.resolve(__dirname, 'downloader.py'); // Path to Python script

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Notify user that the download is starting
        await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

        // Construct the command based on whether quality is provided
        let commandStr = `python3 ${scriptPath} ${url} ${outputDir}`;
        if (quality) {
            commandStr += ` ${quality}`; // Only append quality if it's provided
        }

        exec(commandStr, async (error, stdout, stderr) => {
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
            let output;
            try {
                output = JSON.parse(stdout.trim());
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError.message}`);
                await client.reply(m.chat, `Error parsing download information: ${parseError.message}`, m);
                return;
            }

            if (output.error) {
                await client.reply(m.chat, `Download failed: ${output.message}`, m);
                return;
            }

            const filePath = output.filePath; // The full path to the downloaded file
            const fileName = path.basename(filePath); // Extract file name from path

            // Handle file and send to user
            try {
                const fileSize = fs.statSync(filePath).size;
                const fileSizeMB = fileSize / (1024 * 1024); // Convert bytes to MB
                const fileSizeStr = `${fileSizeMB.toFixed(2)} MB`;

                if (fileSize > 1980 * 1024 * 1024) { // Check if file exceeds 2GB
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 2GB`, m);
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
                
                // Send as a document if size is greater than 99MB
                const isDocument = isVideo && fileSizeMB > 99;

                await client.sendFile(m.chat, filePath, fileName, '', m, { document: isDocument });

                fs.unlinkSync(filePath); // Delete the file after sending
            } catch (fileError) {
                console.error(`Error handling file: ${fileError.message}`);
                await client.reply(m.chat, `Error handling file: ${fileError.message}`, m);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete on error
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
