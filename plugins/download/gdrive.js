const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');
const sleep = promisify(setTimeout);

// ✅ Enter your Google API credentials
const CLIENT_ID = 'Y227069198378-8q7oboi811nr1qgprp8691l55gn2g44e.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// 🔹 Generate authentication URL
function getAccessToken() {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.readonly']
    });

    console.log('🔗 Open this link in your browser and authorize the app:');
    console.log(authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('📌 Enter the code from Google: ', async (code) => {
        rl.close();
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        console.log('✅ Authentication successful!');
        startBot();
    });
}

// 📂 Function to list all files in a folder
async function listFolderFiles(folderId) {
    let allFiles = [];
    async function fetchFiles(parentId, parentPath = '') {
        try {
            const res = await google.drive({ version: 'v3', auth: oAuth2Client }).files.list({
                q: `'${parentId}' in parents and trashed=false`,
                fields: 'files(id, name, mimeType, size)'
            });

            for (const file of res.data.files) {
                allFiles.push({ ...file, path: path.join(parentPath, file.name) });
            }
        } catch (error) {
            console.error('Error listing folder files:', error);
        }
    }

    await fetchFiles(folderId);
    return allFiles;
}

// 📥 Function to download a file
async function downloadFile(fileId, fileName, mimeType, folderPath) {
    const fullFilePath = path.join(folderPath, fileName);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let filePath = fullFilePath;
    const dest = fs.createWriteStream(filePath);

    try {
        let res;
        if (mimeType.startsWith('application/vnd.google-apps')) {
            console.log(`🔄 Exporting Google Docs format: ${mimeType}`);
            const exportMimeTypes = {
                'application/vnd.google-apps.document': 'application/pdf',
                'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.google-apps.presentation': 'application/pdf'
            };
            const exportMimeType = exportMimeTypes[mimeType] || 'application/pdf';
            filePath += exportMimeType.includes('pdf') ? '.pdf' : '.xlsx';

            res = await google.drive({ version: 'v3', auth: oAuth2Client }).files.export(
                { fileId, mimeType: exportMimeType },
                { responseType: 'stream' }
            );
        } else {
            res = await google.drive({ version: 'v3', auth: oAuth2Client }).files.get(
                { fileId, alt: 'media' },
                { responseType: 'stream' }
            );
        }

        res.data.pipe(dest);
        await new Promise((resolve, reject) => {
            dest.on('finish', resolve);
            dest.on('error', reject);
        });

        return filePath;
    } catch (error) {
        console.error('Error downloading file:', error);
        return null;
    }
}

// 📌 WhatsApp Bot Command
function startBot() {
    exports.run = {
        usage: ['gdrive'],
        use: 'link',
        category: 'downloader',
        async: async (m, { client, text, Func }) => {
            if (!text) return client.reply(m.chat, 'Provide a Google Drive link!', m);

            await client.reply(m.chat, '⏳ Fetching file/folder details...', m);
            const match = text.match(/[-\w]{25,}/);
            if (!match) return client.reply(m.chat, 'Invalid Google Drive link.', m);
            const fileId = match[0];

            let fileCount = 0;

            try {
                const res = await google.drive({ version: 'v3', auth: oAuth2Client }).files.get({ fileId, fields: 'id, name, mimeType' });
                const fileInfo = res.data;

                if (fileInfo.mimeType === 'application/vnd.google-apps.folder') {
                    await client.reply(m.chat, `📂 Folder detected: *${fileInfo.name}* \n⏳ Fetching all files...`, m);

                    const folderPath = path.join(__dirname, 'temp', fileInfo.name);
                    const files = await listFolderFiles(fileInfo.id);
                    if (!files.length) return client.reply(m.chat, 'No files found in the folder.', m);

                    for (const file of files) {
                        await sleep(3000);
                        const filePath = await downloadFile(file.id, file.name, file.mimeType, folderPath);
                        if (filePath) {
                            await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${file.name}`, m);
                            fs.unlinkSync(filePath);
                            fileCount++;
                        }
                    }
                } else {
                    await client.reply(m.chat, '📄 Downloading file...', m);
                    const folderPath = path.join(__dirname, 'temp');
                    const filePath = await downloadFile(fileInfo.id, fileInfo.name, fileInfo.mimeType, folderPath);
                    if (filePath) {
                        await sleep(3000);
                        await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${fileInfo.name}`, m);
                        fs.unlinkSync(filePath);
                        fileCount++;
                    }
                }

                await client.reply(m.chat, `✅ *Total Files Processed:* ${fileCount}`, m);
            } catch (error) {
                console.error('Error fetching file details:', error);
                client.reply(m.chat, 'Failed to retrieve file details.', m);
            }
        },
        error: false,
        limit: true,
        cache: true
    };
}

// 🚀 Start authentication process
getAccessToken();
