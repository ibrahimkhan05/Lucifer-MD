const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

exports.run = {
    usage: ['jd', 'jdl'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://example.com/download_link'), m);

        const url = args[0]; // URL provided by the user
        const outputDir = path.resolve(__dirname, 'downloads'); // Directory to save the download
        const scriptPath = path.resolve(__dirname, 'jdownloader.py'); // Path to Python script for JDownloader integration

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Notify user that the download is starting
        const downloadMsg = await client.reply(m.chat, '⏳ Your file is being processed through JDownloader. This may take some time depending on file size...', m);

        // Escape special characters in URL for shell safety
        const escapedUrl = url.replace(/(["\s'$`\\])/g, '\\$1');
        
        // Command to execute the JDownloader Python script
        const commandStr = `python3 "${scriptPath}" "${escapedUrl}" "${outputDir}"`;
        
        console.log(`Executing JDownloader command: ${commandStr}`);
        
        exec(commandStr, { maxBuffer: 100 * 1024 * 1024 }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error.message}`);
                await client.reply(m.chat, `❌ Error downloading file with JDownloader: ${error.message}`, m);
                return;
            }

            // Trim stdout to remove any extra whitespace or newlines
            const cleanedOutput = stdout.trim();
            console.log(`JDownloader script output: ${cleanedOutput}`);
            
            if (stderr) {
                console.error(`Python stderr: ${stderr}`);
            }

            // Parse the stdout to get the file information
            let output;
            try {
                // Try to extract just the JSON part if there's other text
                const jsonMatch = cleanedOutput.match(/(\{.*\})/);
                const jsonStr = jsonMatch ? jsonMatch[0] : cleanedOutput;
                output = JSON.parse(jsonStr);
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError.message}, Raw output: ${cleanedOutput}`);
                await client.reply(m.chat, `❌ Download failed. JDownloader couldn't process the URL or the file is not available.`, m);
                return;
            }

            if (output.error) {
                await client.reply(m.chat, `❌ Download failed: ${output.message || output.error}`, m);
                return;
            }

            // Check if filePath exists in the output
            if (!output.filePath) {
                await client.reply(m.chat, `❌ Download failed: No file path returned from JDownloader`, m);
                return;
            }

            const filePath = output.filePath; // The full path to the downloaded file
            
            // Handle file and send to user
            try {
                if (!fs.existsSync(filePath)) {
                    await client.reply(m.chat, `❌ Download failed: File not found after download process`, m);
                    return;
                }

                const fileName = path.basename(filePath);
                const fileStats = fs.statSync(filePath);
                const fileSize = fileStats.size;
                const fileSizeMB = fileSize / (1024 * 1024); // Convert bytes to MB
                const fileSizeStr = `${fileSizeMB.toFixed(2)} MB`;

                // Check if file exceeds 1930MB (just below 2GB limit)
                if (fileSize > 1930 * 1024 * 1024) {
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum download limit of 1930MB`, m);
                    fs.unlinkSync(filePath); // Delete the file
                    return;
                }

                const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
                const chSize = Func.sizeLimit(fileSize.toString(), maxUpload.toString());

                if (chSize.oversize) {
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds your upload limit (${Func.formatSize(maxUpload)})`, m);
                    fs.unlinkSync(filePath); // Delete the file
                    return;
                }

                await client.reply(m.chat, `📤 Your file (${fileSizeStr}) is being uploaded...`, m);

                const extname = path.extname(fileName).toLowerCase();
                const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.m4v'].includes(extname);
                
                // Send as a document if it's a video and size is greater than 99MB
                const isDocument = isVideo && fileSizeMB > 99;

                // Send caption with file details
                const caption = `📥 *File Downloaded*\n📁 *Name:* ${fileName}\n📊 *Size:* ${fileSizeStr}`;

                await client.sendFile(m.chat, filePath, fileName, caption, m, { document: isDocument });

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
                await client.reply(m.chat, `❌ Error handling file: ${fileError.message}`, m);
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