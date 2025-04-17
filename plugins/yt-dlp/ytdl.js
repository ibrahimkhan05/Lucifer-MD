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
        const formatId = args[1]; // Get format ID from args if provided
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download
        const scriptPath = path.resolve(__dirname, 'downloader.py'); // Path to Python script

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Notify user that the download is starting
        await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

        // Escape special characters in URL
        const escapedUrl = url.replace(/"/g, '\\"');
        
        // Construct the command based on whether format ID is provided
        let commandStr = `python3 "${scriptPath}" "${escapedUrl}" "${outputDir}"`;
        if (formatId) {
            commandStr += ` "${formatId}"`;
        }
        
        console.log(`Executing command: ${commandStr}`);
        
        exec(commandStr, { maxBuffer: 10 * 1024 * 1024 }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error.message}`);
                await client.reply(m.chat, `Error downloading video: ${error.message}`, m);
                return;
            }

            console.log(`Python stdout: ${stdout}`);
            if (stderr) {
                console.error(`Python stderr: ${stderr}`);
            }

            // Parse the stdout to get the file information
            let output;
            try {
                output = JSON.parse(stdout.trim());
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError.message}, Raw output: ${stdout}`);
                await client.reply(m.chat, `Error parsing download information. Check logs for details.`, m);
                return;
            }

            if (output.error) {
                await client.reply(m.chat, `Download failed: ${output.message || output.error}`, m);
                return;
            }

            // Check if filePath exists in the output
            if (!output.filePath) {
                await client.reply(m.chat, `Download failed: No file path returned from downloader`, m);
                return;
            }

            const filePath = output.filePath; // The full path to the downloaded file
            
            // Handle file and send to user
            try {
                if (!fs.existsSync(filePath)) {
                    await client.reply(m.chat, `Download failed: File not found at ${filePath}`, m);
                    return;
                }

                const fileName = path.basename(filePath);
                const fileStats = fs.statSync(filePath);
                const fileSize = fileStats.size;
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

                // Delete the file after sending
                setTimeout(() => {
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`Deleted file: ${filePath}`);
                        }
                    } catch (deleteError) {
                        console.error(`Error deleting file: ${deleteError.message}`);
                    }
                }, 5000); // 5 second delay to ensure file is sent before deletion
            } catch (fileError) {
                console.error(`Error handling file: ${fileError.message}`);
                await client.reply(m.chat, `Error handling file: ${fileError.message}`, m);
                // Attempt to delete the file on error
                try {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (deleteError) {
                    console.error(`Error deleting file: ${deleteError.message}`);
                }
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