const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const GOOGLE_API_KEY = 'AIzaSyAZDqbPmnMb1ZDb_seBOXbNzv-2s3ugxIQ'; // Replace with your actual API key
const DRIVE_API = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });

// Ensure directory exists
function ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    try {
        if (fs.existsSync(dir) && !fs.lstatSync(dir).isDirectory()) {
            fs.renameSync(dir, dir + '_backup_' + Date.now());
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    } catch { }
}

// Get file/folder metadata
async function getDriveFileInfo(url) {
    const match = url.match(/[-\w]{25,}/);
    if (!match) return null;
    const fileId = match[0];

    try {
        const res = await DRIVE_API.files.get({ fileId, fields: 'id, name, mimeType, size' });
        return res.data;
    } catch {
        return null;
    }
}

// List all files and subfolders recursively
async function listFolderFiles(folderId) {
    let allFiles = [];

    async function fetchFiles(parentId, parentPath = '') {
        try {
            const res = await DRIVE_API.files.list({
                q: `'${parentId}' in parents and trashed=false`,
                fields: 'files(id, name, mimeType, size)'
            });

            for (const file of res.data.files) {
                const filePath = path.join(parentPath, file.name);
                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    await fetchFiles(file.id, filePath);
                } else {
                    allFiles.push({ ...file, path: filePath });
                }
            }
        } catch { }
    }

    await fetchFiles(folderId);
    return allFiles;
}

// Convert file size to MB
function formatFileSize(size) {
    return size ? `${(size / 1024 / 1024).toFixed(2)} MB` : 'Unknown';
}

// Download file
async function downloadFile(fileId, fileName, mimeType, folderPath) {
    const fullFilePath = path.join(folderPath, fileName);
    ensureDirectoryExists(fullFilePath);

    let filePath = fullFilePath;
    const dest = fs.createWriteStream(filePath);

    try {
        let res;
        if (mimeType.startsWith('application/vnd.google-apps')) {
            const exportMimeTypes = {
                'application/vnd.google-apps.document': 'application/pdf',
                'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.google-apps.presentation': 'application/pdf'
            };

            const exportMimeType = exportMimeTypes[mimeType] || 'application/pdf';
            filePath += exportMimeType.includes('pdf') ? '.pdf' : '.xlsx';
            ensureDirectoryExists(filePath);

            res = await DRIVE_API.files.export(
                { fileId, mimeType: exportMimeType },
                { responseType: 'stream' }
            );
        } else {
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
    } catch {
        return null;
    }
}

// WhatsApp Bot Command
exports.run = {
    usage: ['gdrive'],
    use: 'link',
    category: 'downloader',
    async: async (m, { client, text }) => {
        if (!text) return client.reply(m.chat, 'Provide a Google Drive link!', m);

        await client.reply(m.chat, '⏳ Fetching file/folder details...', m);
        const fileInfo = await getDriveFileInfo(text);
        if (!fileInfo) return client.reply(m.chat, 'Failed to retrieve file details.', m);

        if (fileInfo.mimeType === 'application/vnd.google-apps.folder') {
            const folderPath = path.join(__dirname, 'temp', fileInfo.name);
            const files = await listFolderFiles(fileInfo.id);
            if (!files.length) return client.reply(m.chat, 'No files found in the folder.', m);

            let fileList = `📂 *Folder:* ${fileInfo.name}\n\n`;
            files.forEach(file => {
                fileList += `📄 *${file.name}* - ${formatFileSize(file.size)}\n`;
            });

            await client.reply(m.chat, fileList, m);

            for (const file of files) {
                await sleep(3000); // 3-second delay
                const filePath = await downloadFile(file.id, file.name, file.mimeType, path.join(folderPath, path.dirname(file.path)));
                if (filePath) {
                    await client.sendFile(m.chat, filePath, path.basename(filePath), '', m);
                    fs.unlinkSync(filePath);
                }
            }
        } else {
            const folderPath = path.join(__dirname, 'temp');
            const fileList = `📄 *File:* ${fileInfo.name}\n📦 *Size:* ${formatFileSize(fileInfo.size)}`;
            
            await client.reply(m.chat, fileList, m);
            await sleep(3000); // 3-second delay

            const filePath = await downloadFile(fileInfo.id, fileInfo.name, fileInfo.mimeType, folderPath);
            if (filePath) {
                await client.sendFile(m.chat, filePath, path.basename(filePath), '', m);
                fs.unlinkSync(filePath);
            }
        }
    },
    error: false,
    limit: true,
    cache: true
};
