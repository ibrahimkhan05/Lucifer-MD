const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

exports.run = {
    usage: ['aria2'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) 
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);

        const url = args[0]; 
        const outputDir = path.resolve(__dirname, 'downloads'); 
        const scriptPath = path.resolve(__dirname, 'aria2_downloader.py'); 

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const safeUrl = `'${encodeURIComponent(url)}'`;
        const safeOutputDir = `'${outputDir}'`;

        const executeDownload = async () => {
            try {
                await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

                const command = `python3 "${scriptPath}" ${safeUrl} ${safeOutputDir}`;
                console.log(`📜 Running command: ${command}`);

                exec(command, { maxBuffer: 1024 * 1024 * 100 }, async (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌ exec error: ${error.message}`);
                        await client.reply(m.chat, `❌ Error downloading file: ${error.message}`, m);
                        return;
                    }

                    if (stderr) {
                        console.error(`⚠️ stderr: ${stderr}`);
                    }

                    let output;
                    try {
                        console.log('Raw stdout:', stdout);
                        output = JSON.parse(stdout.trim());
                    } catch (err) {
                        console.error('❌ Failed to parse JSON:', err.message);
                        await client.reply(m.chat, `❌ Unexpected response from download script.`, m);
                        return;
                    }

                    if (!output.filePath) {
                        await client.reply(m.chat, '❌ Downloaded file path is undefined or missing.', m);
                        return;
                    }

                    const resolvedPath = path.resolve(output.filePath);

                    if (!fs.existsSync(resolvedPath)) {
                        await client.reply(m.chat, '❌ Downloaded file does not exist.', m);
                        return;
                    }

                    const fileName = path.basename(resolvedPath);
                    const fileSize = fs.statSync(resolvedPath).size;
                    const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

                    if (fileSize > 4096 * 1024 * 1024) {
                        await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 4GB.`, m);
                        fs.unlinkSync(resolvedPath);
                        return;
                    }

                    await client.reply(m.chat, `✅ Your file (${fileSizeStr}) is being uploaded.`, m);
                    try {
                        await client.sendFile(m.chat, resolvedPath, fileName, '', m, { document: true });
                    } catch (sendError) {
                        console.error(`❌ Error sending file: ${sendError.message}`);
                        await client.reply(m.chat, `❌ Failed to upload file.`, m);
                    } finally {
                        if (fs.existsSync(resolvedPath)) {
                            fs.unlinkSync(resolvedPath);
                        }
                    }
                });
            } catch (err) {
                console.error('❌ Error starting download:', err);
                await client.reply(m.chat, `❌ Error starting download: ${err.message}`, m);
            }
        };

        executeDownload().catch((err) => {
            console.error('❌ Unhandled error:', err);
        });
    }
};
