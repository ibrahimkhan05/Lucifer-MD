const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const fileType = require('file-type');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const GOOGLE_API_KEY = 'AIzaSyAZDqbPmnMb1ZDb_seBOXbNzv-2s3ugxIQ'; // Replace with your actual API key
const DRIVE_API = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });

// Ensure directory exists
function ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);

    try {
        if (fs.existsSync(dir) && !fs.lstatSync(dir).isDirectory()) {
            console.error(`⚠️ Path exists but is a file: ${dir}. Renaming it.`);
            fs.renameSync(dir, dir + '_backup_' + Date.now());
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    } catch (err) {
        console.error(`❌ Failed to create directory: ${dir}\nError: ${err.message}`);
    }
}

// Get file/folder metadata
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
                    console.log(`📂 Entering folder: ${file.name}`);
                    await fetchFiles(file.id, filePath);
                } else {
                    allFiles.push({ ...file, path: filePath });
                }
            }
        } catch (error) {
            console.error('Error listing folder files:', error);
        }
    }

    await fetchFiles(folderId);
    return allFiles;
}

// Download file
async function downloadFile(fileId, fileName, mimeType, folderPath) {
    ensureDirectoryExists(folderPath);

    let filePath = path.join(folderPath, fileName);
    const dest = fs.createWriteStream(filePath);

    try {
        let res;
        if (mimeType.startsWith('application/vnd.google-apps')) {
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

// WhatsApp Bot Command
exports.run = {
    usage: ['gdrive'],
    use: 'link',
    category: 'downloader',
    async: async (m, { client, text, Func }) => {
        if (!text) return client.reply(m.chat, 'Provide a Google Drive link!', m);

        await client.reply(m.chat, '⏳ Fetching file/folder details...', m);
        const fileInfo = await getDriveFileInfo(text);
        if (!fileInfo) return client.reply(m.chat, 'Failed to retrieve file details.', m);

        if (fileInfo.mimeType === 'application/vnd.google-apps.folder') {
            await client.reply(m.chat, `📂 Folder detected: *${fileInfo.name}* \n⏳ Fetching all files...`, m);

            const folderPath = path.join(__dirname, 'temp', fileInfo.name);
            const files = await listFolderFiles(fileInfo.id);
            if (!files.length) return client.reply(m.chat, 'No files found in the folder.', m);

            for (const file of files) {
                await sleep(3000); // 3-second delay

                const filePath = await downloadFile(file.id, file.name, file.mimeType, path.join(folderPath, path.dirname(file.path)));
                if (filePath) {
                    await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${file.name}\n📦 *Size:* ${file.size || 'Unknown'}`, m);
                    fs.unlinkSync(filePath);
                }
            }
        } else {
            await client.reply(m.chat, '📄 Downloading file...', m);

            const folderPath = path.join(__dirname, 'temp');
            const filePath = await downloadFile(fileInfo.id, fileInfo.name, fileInfo.mimeType, folderPath);
            if (filePath) {
                await sleep(3000); // 3-second delay

                await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${fileInfo.name}\n📦 *Size:* ${fileInfo.size || 'Unknown'}`, m);
                fs.unlinkSync(filePath);
            }
        }
    },
    error: false,
    limit: true,
    cache: true
};
