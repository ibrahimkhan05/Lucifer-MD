const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

exports.run = {
    usage: ['aria2'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) 
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://example.com/file.mp4'), m);

        const url = args[0]; 
        const outputDir = path.resolve(__dirname, 'downloads'); 
        const scriptPath = path.resolve(__dirname, 'aria2_downloader.py'); 

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true }); 
        }

        // Start the Python process with arguments
        const process = spawn('python3', [scriptPath, url, outputDir]); 

        process.stdout.on('data', async (data) => {
            console.log(`stdout: ${data}`);
            try {
                const output = JSON.parse(data.toString().trim());
                if (output.error) {
                    await client.reply(m.chat, `❌ Download failed: ${output.message}`, m);
                } else {
                    const filePath = output.filePath;
                    const fileSize = fs.statSync(filePath).size;
                    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

                    if (fileSize > 1980 * 1024 * 1024) {  // 1980 MB limit
                        await client.reply(m.chat, `💀 File size (${fileSizeMB} MB) exceeds the maximum limit of 1980 MB.`, m);
                        fs.unlinkSync(filePath); // Delete the file
                        return;
                    }

                    await client.reply(m.chat, `✅ Your file (${fileSizeMB} MB) is being uploaded.`, m);
                    const extname = path.extname(filePath).toLowerCase();
                    const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
                    const isDocument = isVideo && fileSize / (1024 * 1024) > 99;

                    await client.sendFile(m.chat, filePath, path.basename(filePath), '', m, { document: isDocument });
                    fs.unlinkSync(filePath); // Delete the file after sending
                }
            } catch (jsonError) {
                console.error(`Error parsing JSON: ${jsonError.message}`);
            }
        });

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        process.on('close', (code) => {
            if (code === null) {
                console.error('❌ Process exited with code: null');
                client.reply(m.chat, '❌ Error: Download process was terminated unexpectedly.', m);
            } else if (code !== 0) {
                console.error(`❌ Process exited with code: ${code}`);
                client.reply(m.chat, `❌ Download failed with exit code: ${code}`, m);
            }
        });
    }
};
