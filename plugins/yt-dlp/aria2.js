const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Custom logger to log all important events to the console
const log = (message) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    console.log(formattedMessage);
};

exports.run = {
    usage: ['aria2'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) {
            log('❌ No URL provided.');
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), m);
        }

        const url = args[0]; 
        const outputDir = path.resolve(__dirname, 'downloads'); 
        const scriptPath = path.resolve(__dirname, 'aria2_downloader.py'); 

        // Ensure the downloads directory exists
        if (!fs.existsSync(outputDir)) {
            log(`📂 Creating downloads directory at ${outputDir}`);
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const safeUrl = `'${url}'`; 
        const safeOutputDir = `'${outputDir}'`;

        const executeDownload = async () => {
            try {
                log('📡 Starting the download process...');
                await client.reply(m.chat, '📥 Your file is being downloaded. This may take some time.', m);

                const command = `python3 "${scriptPath}" ${safeUrl} ${safeOutputDir}`;
                log(`📜 Running command: ${command}`);

                const startTime = Date.now();

                exec(command, { maxBuffer: 1024 * 1024 * 50 }, async (error, stdout, stderr) => { 
                    if (error) {
                        log(`❌ exec error: ${error.message}`);
                        await client.reply(m.chat, `❌ Error downloading file: ${error.message}`, m);
                        return;
                    }

                    if (stderr) {
                        log(`⚠️ stderr: ${stderr}`);
                    }

                    log(`📜 stdout: ${stdout}`);

                    let output;
                    try {
                        output = JSON.parse(stdout.trim());
                    } catch (err) {
                        log(`❌ Failed to parse JSON: ${err.message}`);
                        await client.reply(m.chat, `❌ Unexpected response from download script.`, m);
                        return;
                    }

                    if (!output.filePath) {
                        log('❌ Downloaded file path is undefined or missing.');
                        await client.reply(m.chat, '❌ Downloaded file path is undefined or missing.', m);
                        return;
                    }

                    const resolvedPath = path.resolve(output.filePath);
                    log(`📦 File Path: ${resolvedPath}`);

                    if (!fs.existsSync(resolvedPath)) {
                        log('❌ Downloaded file does not exist.');
                        await client.reply(m.chat, '❌ Downloaded file does not exist.', m);
                        return;
                    }

                    const fileName = path.basename(resolvedPath);
                    const fileSize = fs.statSync(resolvedPath).size;
                    const fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

                    log(`📦 File Name: ${fileName}`);
                    log(`📦 File Size: ${fileSizeStr}`);

                    if (fileSize > 4096 * 1024 * 1024) { 
                        log(`💀 File size (${fileSizeStr}) exceeds the maximum limit of 4GB.`);
                        await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 4GB.`, m);
                        fs.unlinkSync(resolvedPath); 
                        log(`🗑️ File deleted due to size limit.`);
                        return;
                    }

                    log(`⏳ Starting file processing at ${new Date().toISOString()}`);
                    
                    try {
                        log('📤 Preparing file for upload...');
                        const startProcessTime = Date.now();

                        const extname = path.extname(fileName).toLowerCase();
                        const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extname);
                        const isDocument = isVideo && fileSize / (1024 * 1024) > 99;

                        const stream = fs.createReadStream(resolvedPath);
                        await client.sendFile(m.chat, stream, fileName, '', m, { document: isDocument });

                        const processTime = ((Date.now() - startProcessTime) / 1000).toFixed(2);
                        log(`✅ File sent successfully in ${processTime}s.`);
                    } catch (sendError) {
                        log(`❌ Error sending file: ${sendError.message}`);
                        log(`🔍 Stack trace: ${sendError.stack}`);
                        await client.reply(m.chat, `❌ Failed to upload file.`, m);
                    } finally {
                        if (fs.existsSync(resolvedPath)) {
                            fs.unlinkSync(resolvedPath); 
                            log('🗑️ File deleted after sending.');
                        }
                    }

                    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
                    log(`🏁 Total process time: ${totalTime}s.`);
                });
            } catch (err) {
                log(`❌ Error starting download: ${err.message}`);
                log(`🔍 Stack trace: ${err.stack}`);
                await client.reply(m.chat, `❌ Error starting download: ${err.message}`, m);
            }
        };

        executeDownload().catch((err) => {
            log(`❌ Unhandled error: ${err.message}`);
            log(`🔍 Stack trace: ${err.stack}`);
        });
    }
};
