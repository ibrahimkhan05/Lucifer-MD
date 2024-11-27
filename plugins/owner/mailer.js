const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // For generating random filenames

// List of supported file extensions for various document types, images, audio, and video
const supportedExtensions = [
    '.pdf', '.doc', '.docx', '.xlsx', '.pptx', '.txt', '.odt', '.csv', '.zip', '.rar', 
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.ico', '.webp', 
    '.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aiff', '.wma', 
    '.mp4', '.avi', '.mov', '.wmv', '.mkv', '.flv', '.webm', '.3gp', 
    '.svg', '.json', '.xml', '.html', '.css', '.js', '.php', 
    '.exe', '.apk', '.jar', '.bat', '.sh', '.psd', '.ai', '.eps', 
    '.indd', '.epub', '.chm', '.pdb', '.fb2', '.mobi', '.azw3', 
    '.rar', '.7z', '.tar', '.gzip', '.bz2', '.xz', '.iso', '.img', 
    '.dmg', '.bin', '.vmdk', '.vhd', '.cue', '.torrent', '.md', 
    '.rtf', '.sql', '.yaml', '.csv', '.vcf', '.ics', '.vcard', '.bak', 
    '.log', '.dat', '.torrent', '.cue', '.ccd', '.nrg'
];

exports.run = {
    usage: ['mail'],
    use: 'email | subject | message',
    category: 'owner',
    owner: true,
    async: async (m, { client, args, isPrefix, text, command, Func }) => {
        try {
            let filePath = null;
            let email = '';
            let subject = '';
            let msg = '';
            let randomFileName = '';  // Ensure randomFileName is declared outside of the conditional blocks.

            console.log('Step 1: Checking if the message is a reply to any media.');

            // Check if the message is a reply to any media (image, video, document, etc.)
            if (m.quoted) {
                const media = m.quoted;
                console.log('Step 2: Message is a reply. Checking media type...');

                // Handle document files
                if (media.mtype === 'documentMessage') {
                    console.log('Step 7: Media is a document. Proceeding to handle document...');
                    
                    // Get the file name with extension or generate random name
                    randomFileName = media.filename || crypto.randomBytes(8).toString('hex') + path.extname(media.url);
                    const fileExtension = path.extname(randomFileName).toLowerCase();

                    // Ensure that the extension is supported
                    if (supportedExtensions.includes(fileExtension)) {
                        console.log(`Step 8: Supported document extension detected: ${fileExtension}`);
                        
                        // Prepare the email body and subject
                        email = text.trim();
                        subject = `Your document from WhatsApp`;
                        msg = `File name: **${randomFileName}**`;

                        // Check if the file is available and handle accordingly
                        filePath = media.url;
                    } else {
                        console.log(`Step 9: Unsupported file extension detected: ${fileExtension}`);
                        return client.reply(m.chat, '❌ Unsupported file extension. Please send a supported document type.', m);
                    }
                } else if (media.mtype === 'imageMessage' || media.mtype === 'videoMessage' || media.mtype === 'audioMessage') {
                    // Handle image, video, and audio files (use a random name for media files)
                    randomFileName = crypto.randomBytes(8).toString('hex') + path.extname(media.url);
                    const mediaType = media.mtype === 'imageMessage' ? 'Image' : media.mtype === 'videoMessage' ? 'Video' : 'Audio';
                    
                    console.log(`Step 10: Media type is ${mediaType}. Proceeding to handle ${mediaType.toLowerCase()}...`);
                    email = text.trim();
                    subject = `${mediaType} from WhatsApp`;
                    msg = `Your ${mediaType} has been sent as an attachment.`;
                    filePath = media.url;
                } else {
                    console.log(`Step 11: Unsupported media type detected: ${media.mtype}`);
                    return client.reply(m.chat, '❌ Unsupported media type. Please send a valid file.', m);
                }
            } else {
                console.log('Step 4: No media found in the reply.');
                return client.reply(m.chat, '❌ No media file found in the reply.', m);
            }

            // Step 12: Sending email
            console.log('Step 12: Sending email...');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'notifications@lucifercloud.app',  // Replace with your email
                    pass: 'Hiba@marijan09'          // Replace with your email password or use OAuth
                }
            });

            const mailOptions = {
                from: 'notifications@lucifercloud.app',
                to: email,
                subject: subject,
                text: msg,
                attachments: [
                    {
                        filename: randomFileName,
                        path: filePath
                    }
                ]
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(`❌ Error while sending email: ${error}`);
                    client.reply(m.chat, '❌ Error while sending email.', m);
                } else {
                    console.log(`✅ Email sent successfully: ${info.response}`);
                    client.reply(m.chat, '✅ Your file has been sent to the specified email address.', m);
                }
            });

        } catch (error) {
            console.log(`❌ An error occurred: ${error}`);
            client.reply(m.chat, '❌ An error occurred while processing your request.', m);
        }
    }
};
