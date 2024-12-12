const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process'); // Changed exec to spawn
const axios = require('axios'); // For HTTP request to check file size

exports.run = {
    usage: ['aria2'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) 
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);

        const url = args[0]; // Get URL from args
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download
        const scriptPath = path.resolve(__dirname, 'aria2_downloader.py'); // Path to Python script

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true }); // Ensure directory and its parent exists
        }

        const safeUrl = `'${url}'`; 
        const safeOutputDir = `'${outputDir}'`;

        const executeDownload = async () => {
            try {
                await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

                const process = spawn('python3', [scriptPath, url, outputDir]); // Using spawn instead of exec

                process.stdout.on('data', async (data) => {
                    console.log(`stdout: ${data}`);
                    try {
                        const output = JSON.parse(data.toString().trim());
                        if (output.error) {
                            await client.reply(m.chat, `Download failed: ${output.message}`, m);
                            return;
                        }

                        const filePath = output.filePath; // Full path to the downloaded file
                        const fileName = path.basename(filePath); // Extract file name from path

                        try {
                            const fileSize = fs.statSync(filePath).size;
                            const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

                            if (fileSize > 1980 * 1024 * 1024) {
                                await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 1980MB`, m);
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
                            const isDocument = isVideo && fileSize / (1024 * 1024) > 99;

                            await client.sendFile(m.chat, filePath, fileName, '', m, { document: isDocument });

                            fs.unlinkSync(filePath); // Delete the file after sending
                        } catch (parseError) {
                            console.error(`Error handling file: ${parseError.message}`);
                            await client.reply(m.chat, `Error handling file: ${parseError.message}`, m);
                            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        }
                    } catch (jsonError) {
                        console.error(`Error parsing JSON: ${jsonError.message}`);
                    }
                });

                process.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                });

                process.on('close', async (code) => {
                    if (code !== 0) {
                        console.error(`Process exited with code ${code}`);
                        await client.reply(m.chat, `Download process failed with exit code ${code}`, m);
                    }
                });
            } catch (err) {
                console.error('Error starting download:', err);
                await client.reply(m.chat, `Error starting download: ${err.message}`, m);
            }
        };

        executeDownload();
    }
};
