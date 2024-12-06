const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

exports.run = {
    usage: ['cvbi'],
    use: 'url [quality]',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func }) => {
        if (!args || !args[0]) {
            return client.reply(
                m.chat,
                Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=example'),
                m
            );
        }

        const url = args[0];
        const quality = args[1] || ''; // Use empty quality if not provided
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save downloads
        const scriptPath = path.resolve(__dirname, 'downloader.py'); // Path to the Python script

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Notify user about download start
        await client.reply(m.chat, 'Downloading your file, please wait...', m);

        // Execute the Python script
        exec(`python3 ${scriptPath} ${url} ${outputDir} ${quality}`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error.message}`);
                await client.reply(m.chat, `Error downloading file: ${error.message}`, m);
                return;
            }

            if (stderr) {
                console.error(`Standard error: ${stderr}`);
                await client.reply(m.chat, `Error downloading file: ${stderr}`, m);
                return;
            }

            try {
                const output = JSON.parse(stdout.trim());
                if (output.error) {
                    await client.reply(m.chat, `Download failed: ${output.message}`, m);
                    return;
                }

                const filePath = output.filePath; // Full path to the downloaded file
                const fileSize = fs.statSync(filePath).size;
                const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

                // Check file size limits
                const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
                const chSize = Func.sizeLimit(fileSize.toString(), maxUpload.toString());

                if (chSize.oversize) {
                    await client.reply(
                        m.chat,
                        `💀 File size (${fileSizeStr}) exceeds the maximum limit of ${maxUpload} MB.`,
                        m
                    );
                    fs.unlinkSync(filePath); // Delete the file
                    return;
                }

                // Notify user about file upload
                await client.reply(m.chat, `Uploading your file (${fileSizeStr}), please wait...`, m);

                // Send the file to the user
                await client.sendFile(m.chat, filePath, path.basename(filePath), '', m);

                // Cleanup: delete the file after sending
                fs.unlinkSync(filePath);
            } catch (parseError) {
                console.error(`Error processing output: ${parseError.message}`);
                await client.reply(m.chat, `Error handling the downloaded file: ${parseError.message}`, m);
            }
        });
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename,
};
