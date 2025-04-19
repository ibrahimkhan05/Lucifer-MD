const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const axios = require('axios');
const { promisify } = require('util');
const streamPipeline = promisify(require('stream').pipeline);

exports.run = {
    usage: ['idm'],
    use: 'url',
    category: 'special',
    async: async (m, { client, args, isPrefix, command, users, env, Func, Scraper }) => {
        if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.example.com/file.zip'), m);

        const url = args[0];
        const outputDir = path.resolve(__dirname, 'downloads');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const getFileName = (url) => {
            const urlObj = new URL(url);
            return path.basename(urlObj.pathname);
        };

        const downloadFile = async (url, outputDir) => {
            const fileName = getFileName(url);
            const filePath = path.resolve(outputDir, fileName);
            const fileStream = fs.createWriteStream(filePath);

            try {
                const response = await axios({
                    method: 'GET',
                    url: url,
                    responseType: 'stream',
                });

                const contentDisposition = response.headers['content-disposition'];
                if (contentDisposition) {
                    const filenameFromHeader = contentDisposition.split('filename=')[1].replace(/"/g, '');
                    const newFilePath = path.resolve(outputDir, filenameFromHeader);
                    const newFileStream = fs.createWriteStream(newFilePath);
                    await streamPipeline(response.data, newFileStream);
                    console.log(`✅ Downloaded file as: ${filenameFromHeader}`);
                    return newFilePath;
                } else {
                    await streamPipeline(response.data, fileStream);
                    console.log(`✅ Downloaded file as: ${fileName}`);
                    return filePath;
                }
            } catch (error) {
                console.error(`❌ Error downloading file: ${error.message}`);
                throw new Error('Download failed');
            }
        };

        const executeDownload = async () => {
            try {
                await client.reply(m.chat, 'Your file is being downloaded. This may take some time.', m);

                const filePath = await downloadFile(url, outputDir);
                const fileStats = fs.statSync(filePath);
                const fileSizeMB = fileStats.size / (1024 * 1024);
                const fileSizeStr = `${fileSizeMB.toFixed(2)} MB`;
                const fileName = path.basename(filePath);
                const fileExt = path.extname(fileName).toLowerCase();

                console.log(`📦 File Path: ${filePath}`);
                console.log(`📦 File Name: ${fileName}`);
                console.log(`📦 File Size: ${fileSizeStr}`);
                console.log(`📦 File Extension: ${fileExt}`);

                // Check if file size exceeds the maximum limit (1980MB)
                if (fileStats.size > 1980 * 1024 * 1024) {
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit of 1980MB.`, m);
                    fs.unlinkSync(filePath);
                    return;
                }

                // Check if file size exceeds the user's upload limit
                const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
                const chSize = Func.sizeLimit(fileStats.size.toString(), maxUpload.toString());
                if (chSize.oversize) {
                    await client.reply(m.chat, `💀 File size (${fileSizeStr}) exceeds the maximum limit.`, m);
                    fs.unlinkSync(filePath);
                    return;
                }

                await client.reply(m.chat, `✅ Your file (${fileSizeStr}) is being uploaded.`, m);

                let sendAsDocument = fileSizeMB > 99; // Send as document if file is larger than 100MB

                try {
                    await client.sendFile(m.chat, filePath, fileName, '', m, { document: sendAsDocument });
                    console.log('✅ File sent successfully.');
                } catch (sendError) {
                    console.error(`❌ Error sending file: ${sendError.message}`);
                    await client.reply(m.chat, `❌ Failed to upload file.`, m);
                } finally {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log('🗑️ File deleted after sending.');
                    }
                }
            } catch (err) {
                console.error('❌ Error starting download:', err);
                await client.reply(m.chat, `❌ Error starting download: ${err.message}`, m);
            }
        };

        executeDownload();
    }
};
