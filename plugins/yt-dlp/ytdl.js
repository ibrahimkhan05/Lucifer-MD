const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

exports.run = {
    usage: ['cvbi'],
    use: 'url [quality]',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) 
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);

        const url = args[0];
        const quality = args[1] || ''; 
        const outputDir = path.resolve(__dirname, 'downloads'); 
        const scriptPath = path.resolve(__dirname, 'downloader.py'); 

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true }); 
        }

        // Escape the URL, paths, and arguments
        const safeUrl = `'${url.replace(/'/g, "'\\''")}'`; 
        const safeOutputDir = `'${outputDir.replace(/'/g, "'\\''")}'`; 
        const safeQuality = quality ? `'${quality.replace(/'/g, "'\\''")}'` : '';

        // Notify user that the download is starting
        await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

        const command = `python3 ${scriptPath} ${safeUrl} ${safeOutputDir} ${safeQuality}`;
        console.log(`Running command: ${command}`);

        exec(command, async (error, stdout, stderr) => {
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

            let output;
            try {
                output = JSON.parse(stdout.trim());
            } catch (e) {
                console.error('JSON parse error:', e.message);
                await client.reply(m.chat, `Error parsing download response: ${e.message}`, m);
                return;
            }

            if (output.error) {
                await client.reply(m.chat, `Download failed: ${output.message}`, m);
                return;
            }

            const filePath = output.filePath;
            const fileName = path.basename(filePath);
            const fileSize = fs.statSync(filePath).size;
            const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

            if (fileSize > 930 * 1024 * 1024) {
                await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 930MB`, m);
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
            const isDocument = isVideo && fileSize / (1024 * 1024) > 99; 

            await client.sendFile(m.chat, filePath, fileName, '', m, { document: isDocument });

            fs.unlinkSync(filePath); 
        });
    }
};
