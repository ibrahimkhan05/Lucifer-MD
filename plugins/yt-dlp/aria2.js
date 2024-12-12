const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

exports.run = {
    usage: ['aria2'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command }) => {
        if (!args || !args[0]) 
            return client.reply(m.chat, `❌ Please provide a URL.\nExample: ${isPrefix}${command} https://example.com/file.mp4`, m);

        const url = args[0]; 
        const outputDir = path.resolve(__dirname, 'downloads'); 
        const scriptPath = path.resolve(__dirname, 'aria2_downloader.py'); 

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true }); 
        }

        const process = spawn('python3', [scriptPath, url, outputDir]);

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            try {
                const output = JSON.parse(data.toString().trim());
                if (output.error) {
                    client.reply(m.chat, `❌ Download failed: ${output.message}`, m);
                } else {
                    const filePath = output.filePath;
                    const fileSize = fs.statSync(filePath).size;
                    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

                    if (fileSize > 1980 * 1024 * 1024) {  // File limit check (1980 MB)
                        client.reply(m.chat, `❌ File size (${fileSizeMB} MB) exceeds the 1980 MB limit.`, m);
                        fs.unlinkSync(filePath); // Delete file
                        return;
                    }

                    client.reply(m.chat, `✅ Your file (${fileSizeMB} MB) is being uploaded. Please wait...`, m);

                    const readStream = fs.createReadStream(filePath);
                    const extname = path.extname(filePath).toLowerCase();
                    const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
                    const isDocument = fileSize / (1024 * 1024) > 99; // If file is > 99 MB, send as document

                    client.sendMessage(m.chat, {
                        document: readStream,
                        fileName: path.basename(filePath),
                        caption: `Here is your file: ${path.basename(filePath)}`,
                    }).then(() => {
                        fs.unlinkSync(filePath); // Delete file after sending
                    }).catch((err) => {
                        console.error(`❌ Error sending file: ${err.message}`);
                        client.reply(m.chat, '❌ Failed to upload file.', m);
                    });
                }
            } catch (err) {
                console.error(`❌ JSON Parsing Error: ${err.message}`);
            }
        });

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        process.on('close', (code) => {
            if (code === null) {
                console.error('❌ Process exited with code: null');
                client.reply(m.chat, '❌ Download process terminated unexpectedly.', m);
            } else if (code !== 0) {
                console.error(`❌ Process exited with code: ${code}`);
                client.reply(m.chat, `❌ Download failed with exit code: ${code}`, m);
            }
        });

        process.on('error', (err) => {
            console.error(`❌ Process error: ${err.message}`);
            client.reply(m.chat, '❌ Download process failed.', m);
        });
    }
};
