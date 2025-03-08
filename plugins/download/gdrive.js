const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const fileType = require('file-type');

const GOOGLE_API_KEY = 'AIzaSyAZDqbPmnMb1ZDb_seBOXbNzv-2s3ugxIQ'; // Replace with your API key
const DRIVE_API = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });

// Get file metadata
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

// List all files and subfolders
async function listFolderFiles(folderId) {
    let allFiles = [];

    async function fetchFiles(parentId, parentPath = '') {
        try {
            const res = await DRIVE_API.files.list({
                q: `'${parentId}' in parents and trashed=false`,
                fields: 'files(id, name, mimeType, size)'
            });

            for (const file of res.data.files) {
                const safeFileName = file.name.replace(/[<>:"/\\|?*]+/g, ''); // Sanitize filename
                const filePath = path.join(parentPath, safeFileName);

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

// Download file with Google Drive export support
async function downloadFile(fileId, fileName, mimeType, folderPath) {
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let filePath = path.join(folderPath, fileName);
    const dest = fs.createWriteStream(filePath);

    try {
        let res;
        if (mimeType.startsWith('application/vnd.google-apps')) {
            const exportMimeTypes = {
                'application/vnd.google-apps.document': 'application/pdf',
                'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.google-apps.presentation': 'application/pdf',
                'application/vnd.google-apps.drawing': 'image/png'
            };

            const exportMimeType = exportMimeTypes[mimeType];
            if (!exportMimeType) {
                console.error(`Unsupported Google file type: ${mimeType}`);
                return null;
            }

            filePath += exportMimeType.includes('pdf') ? '.pdf' : exportMimeType.includes('png') ? '.png' : '.xlsx';

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
            await client.reply(m.chat, `📂 Folder detected: *${fileInfo.name}* \n⏳ Fetching all files...`, m);

            const folderPath = path.join(__dirname, 'temp', fileInfo.name.replace(/[<>:"/\\|?*]+/g, ''));
            const files = await listFolderFiles(fileInfo.id);
            if (!files.length) return client.reply(m.chat, 'No files found in the folder.', m);

            for (const file of files) {
                const filePath = await downloadFile(file.id, file.name, file.mimeType, path.join(folderPath, path.dirname(file.path)));
                if (filePath) {
                    const detectedType = await fileType.fromFile(filePath);
                    const extension = detectedType ? `.${detectedType.ext}` : path.extname(filePath);

                    await new Promise(resolve => setTimeout(resolve, 3000)); // 3-sec delay before sending file

                    if (detectedType && detectedType.mime.startsWith('video/')) {
                        if (parseFloat(file.size) > 99 * 1024 * 1024) {
                            await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${file.name}`, m, { asDocument: true });
                        } else {
                            await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${file.name}`, m);
                        }
                    } else {
                        await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${file.name}`, m);
                    }

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

                await new Promise(resolve => setTimeout(resolve, 3000)); // 3-sec delay before sending file

                if (detectedType && detectedType.mime.startsWith('video/')) {
                    if (parseFloat(fileInfo.size) > 99 * 1024 * 1024) {
                        await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${fileInfo.name}`, m, { asDocument: true });
                    } else {
                        await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${fileInfo.name}`, m);
                    }
                } else {
                    await client.sendFile(m.chat, filePath, path.basename(filePath), `📄 *File Name:* ${fileInfo.name}`, m);
                }

                fs.unlinkSync(filePath);
            }
        }
    },
    error: false,
    limit: true,
    cache: true
};
