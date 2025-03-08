const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fileType = require('file-type');

const GOOGLE_API_KEY = 'AIzaSyAZDqbPmnMb1ZDb_seBOXbNzv-2s3ugxIQ'; // Replace with your API key
const DRIVE_API = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });

// Get file metadata (file/folder)
async function getDriveFileInfo(url) {
    const match = url.match(/[-\w]{25,}/);
    if (!match) return null;
    const fileId = match[0];

    try {
        const res = await DRIVE_API.files.get({ fileId, fields: 'id, name, mimeType, size' });
        return res.data;
    } catch (error) {
        console.error('Error fetching file info:', error);
        return null;
    }
}

// List all files in a folder
async function listFolderFiles(folderId) {
    try {
        const res = await DRIVE_API.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, size)'
        });
        return res.data.files;
    } catch (error) {
        console.error('Error listing folder files:', error);
        return [];
    }
}

// Check if file/folder is oversized
function isOversized(size, users, env) {
    const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
    return size > maxUpload;
}

// Download a file from Google Drive
async function downloadFile(fileId, fileName, mimeType, folderPath) {
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let filePath = path.join(folderPath, fileName);
    const dest = fs.createWriteStream(filePath);

    try {
        let res;
        if (mimeType.startsWith('application/vnd.google-apps')) {
            // Convert Google Docs, Sheets, and Slides
            const exportMimeTypes = {
                'application/vnd.google-apps.document': 'application/pdf',
                'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.google-apps.presentation': 'application/pdf'
            };

            const exportMimeType = exportMimeTypes[mimeType];
            if (!exportMimeType) {
                console.error(`Unsupported Google file type: ${mimeType}`);
                return null;
            }

            filePath += exportMimeType.includes('pdf') ? '.pdf' : '.xlsx';

            res = await DRIVE_API.files.export(
                { fileId, mimeType: exportMimeType },
                { responseType: 'stream' }
            );
        } else {
            // Normal file download
            res = await DRIVE_API.files.get(
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

exports.run = {
    usage: ['gdrive'],
    use: 'link',
    category: 'downloader',
    async: async (m, { client, text, users, env, Func, Scraper }) => {
        if (!text) return client.reply(m.chat, 'Provide a Google Drive link!', m);

        await client.reply(m.chat, '⏳ Fetching file/folder details...', m);
        const fileInfo = await getDriveFileInfo(text);
        if (!fileInfo) return client.reply(m.chat, 'Failed to retrieve file details.', m);

        if (fileInfo.mimeType === 'application/vnd.google-apps.folder') {
            await client.reply(m.chat, `📂 Folder detected: *${fileInfo.name}* \n⏳ Fetching contents...`, m);

            const folderPath = path.join(__dirname, 'temp', fileInfo.name);
            const files = await listFolderFiles(fileInfo.id);
            if (!files.length) return client.reply(m.chat, 'No files found in the folder.', m);

            for (const file of files) {
                if (isOversized(parseFloat(file.size || 0), users, env)) {
                    await client.reply(m.chat, `⚠️ Skipping *${file.name}* (Too large)`, m);
                    continue;
                }

                const filePath = await downloadFile(file.id, file.name, file.mimeType, folderPath);
                if (filePath) {
                    const detectedType = await fileType.fromFile(filePath);
                    const extension = detectedType ? `.${detectedType.ext}` : path.extname(filePath);

                    await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${file.name}\n📦 *Size:* ${file.size || 'Unknown'}`, m);
                    fs.unlinkSync(filePath);
                }
            }
        } else {
            await client.reply(m.chat, '📄 Downloading file...', m);

            const folderPath = path.join(__dirname, 'temp');
            const filePath = await downloadFile(fileInfo.id, fileInfo.name, fileInfo.mimeType, folderPath);
            if (filePath) {
                const detectedType = await fileType.fromFile(filePath);
                const extension = detectedType ? `.${detectedType.ext}` : path.extname(filePath);

                await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${fileInfo.name}\n📦 *Size:* ${fileInfo.size || 'Unknown'}`, m);
                fs.unlinkSync(filePath);
            }
        }
    },
    error: false,
    limit: true,
    cache: true
};
