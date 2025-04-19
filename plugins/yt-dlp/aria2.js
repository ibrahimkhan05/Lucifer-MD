const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Function to get file information before download using aria2c
const getFileInfo = (url) => {
    return new Promise((resolve, reject) => {
        const cmd = `aria2c --show-files "${url}"`;  // Use aria2c to get file info
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error getting file info: ${error.message}`));
            }
            if (stderr) {
                reject(new Error(`aria2c stderr: ${stderr}`));
            }

            // Parse the stdout to extract file details
            const fileInfo = stdout.split('\n').filter(line => line.includes('  '));
            const fileDetails = fileInfo.map(line => {
                const [index, size, path] = line.trim().split(/\s+/);
                return { index, size: parseInt(size, 10), path };
            });

            resolve(fileDetails);
        });
    });
};

exports.run = {
    usage: ['aria2'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.example.com/file'), m);

        const url = args[0];
        const outputDir = path.resolve(__dirname, 'downloads');
        const scriptPath = path.resolve(__dirname, 'aria2_downloader.py');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const safeUrl = `'${url}'`;
        const safeOutputDir = `'${outputDir}'`;

        // Fetch file information before download
        try {
            const fileInfo = await getFileInfo(url);

            if (fileInfo.length === 0) {
                return client.reply(m.chat, '❌ Unable to fetch file details.', m);
            }

            const file = fileInfo[0];  // Assuming the first file info is the correct one
            const fileSize = file.size;
            const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
            let fileExt = path.extname(file.path).toLowerCase();  // Get the file extension

            console.log(`📦 File Info:`);
            console.log(`📦 File Name: ${file.path}`);
            console.log(`📦 File Size: ${fileSizeMB} MB`);
            console.log(`📦 File Extension: ${fileExt}`);

            // If the extension is missing or incorrect, modify the extension as needed
            if (!fileExt || fileExt === '.temp') {
                // You can implement a method to detect the file type based on content if necessary
                // For now, default to a basic extension
                fileExt = '.bin';  // Default to binary file
                console.log(`📦 File extension not found. Defaulting to ${fileExt}`);
            }

            const fileName = path.basename(file.path, path.extname(file.path)) + fileExt;  // Use the correct extension

            const resolvedPath = path.resolve(outputDir, fileName);

            // Check file size before downloading
            if (fileSize > 1980 * 1024 * 1024) {  // Max size 1980MB
                await client.reply(m.chat, `💀 File size (${fileSizeMB} MB) exceeds the maximum limit of 1980MB.`, m);
                return;
            }

            // Proceed with downloading the file using the correct extension
            await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

            const command = `python3 "${scriptPath}" ${safeUrl} ${safeOutputDir}`;
            console.log(`📜 Running command: ${command}`);

            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ exec error: ${error.message}`);
                    await client.reply(m.chat, `❌ Error downloading file: ${error.message}`, m);
                    return;
                }

                if (stderr) console.error(`⚠️ stderr: ${stderr}`);

                let output;
                try {
                    output = JSON.parse(stdout.trim());
                } catch (err) {
                    console.error(`❌ Failed to parse JSON: ${err.message}`);
                    await client.reply(m.chat, `❌ Unexpected response from download script.`, m);
                    return;
                }

                if (!output.filePath) {
                    await client.reply(m.chat, '❌ Downloaded file path is undefined or missing.', m);
                    return;
                }

                const finalPath = path.resolve(output.filePath);
                if (!fs.existsSync(finalPath)) {
                    await client.reply(m.chat, '❌ Downloaded file does not exist.', m);
                    return;
                }

                // Rename the downloaded file with the correct extension
                const renamedPath = path.resolve(outputDir, fileName);
                fs.renameSync(finalPath, renamedPath);

                const fileSizeFinal = fs.statSync(renamedPath).size;
                const fileSizeFinalMB = fileSizeFinal / (1024 * 1024);
                const fileSizeStr = `${fileSizeFinalMB.toFixed(2)} MB`;

                await client.reply(m.chat, `✅ File downloaded and saved as ${fileName} (${fileSizeStr}).`, m);

                let sendAsDocument = fileSizeFinalMB > 99;

                try {
                    await client.sendFile(m.chat, renamedPath, fileName, '', m, { document: sendAsDocument });
                    console.log('✅ File sent successfully.');
                } catch (sendError) {
                    console.error(`❌ Error sending file: ${sendError.message}`);
                    await client.reply(m.chat, `❌ Failed to upload file.`, m);
                } finally {
                    if (fs.existsSync(renamedPath)) {
                        fs.unlinkSync(renamedPath);
                        console.log('🗑️ File deleted after sending.');
                    }
                }
            });
        } catch (err) {
            console.error('❌ Error starting download:', err);
            await client.reply(m.chat, `❌ Error starting download: ${err.message}`, m);
        }
    }
};
