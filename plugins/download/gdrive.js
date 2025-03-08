const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const GOOGLE_API_KEY = 'AIzaSyAZDqbPmnMb1ZDb_seBOXbNzv-2s3ugxIQ'; // Replace with your API key
const DRIVE_API = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });

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

async function downloadFile(fileId, fileName, mimeType) {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const extension = mime.extension(mimeType) || 'bin';
    const filePath = path.join(tempDir, `${fileName}.${extension}`);
    const dest = fs.createWriteStream(filePath);
    const res = await DRIVE_API.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    res.data.pipe(dest);
    return new Promise((resolve, reject) => {
        dest.on('finish', () => resolve(filePath));
        dest.on('error', reject);
    });
}

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

exports.run = {
    usage: ['gdrive'],
    use: 'link',
    category: 'downloader',
    async: async (m, { client, text, users, env, Func, Scraper }) => {
        if (!text) return client.reply(m.chat, 'Provide a Google Drive link!', m);
        
        await client.reply(m.chat, '⏳ Fetching file/folder details...', m);
        const fileInfo = await getDriveFileInfo(text);
        if (!fileInfo) return client.reply(m.chat, 'Failed to retrieve file details.', m);
        
        const sizeUnits = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
        const sizeValue = parseFloat(fileInfo.size);
        const sizeUnit = sizeUnits['B'] || 1;
        const sizeInBytes = sizeValue * sizeUnit;
        
        const maxUpload = users.premium ? env.max_upload : env.max_upload_free;
        const isOver = `💀 File size (${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit, download it by yourself via this link: ${await (await Scraper.shorten(text)).data.url}`;
        const chSize = Func.sizeLimit(sizeInBytes.toString(), maxUpload.toString());

        if (chSize.oversize) {
            return client.reply(m.chat, isOver, m);
        }
        
        if (fileInfo.mimeType === 'application/vnd.google-apps.folder') {
            const files = await listFolderFiles(fileInfo.id);
            if (!files.length) return client.reply(m.chat, 'No files found in the folder.', m);
            
            for (const file of files) {
                const sizeValue = parseFloat(file.size);
                const sizeInBytes = sizeValue * sizeUnit;
                const chSize = Func.sizeLimit(sizeInBytes.toString(), maxUpload.toString());

                if (chSize.oversize) {
                    await client.reply(m.chat, `⚠️ Skipping ${file.name} (size: ${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB) as it exceeds the limit.`, m);
                    continue;
                }
                const filePath = await downloadFile(file.id, file.name, file.mimeType);
                await client.sendFile(m.chat, filePath, file.name, `📂 *File Name:* ${file.name}\n📦 *Size:* ${file.size || 'Unknown'}`, m);
                fs.unlinkSync(filePath);
            }
        } else {
            const filePath = await downloadFile(fileInfo.id, fileInfo.name, fileInfo.mimeType);
            await client.sendFile(m.chat, filePath, fileInfo.name, `📄 *File Name:* ${fileInfo.name}\n📦 *Size:* ${fileInfo.size || 'Unknown'}`, m);
            fs.unlinkSync(filePath);
        }
    },
    error: false,
    limit: true,
    cache: true
};
