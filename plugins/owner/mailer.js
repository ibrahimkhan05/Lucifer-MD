const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['mail'],
    use: 'email | subject | message',
    category: 'owner',
    owner: true,
    async: async (m, { client, args, isPrefix, text, command, Func }) => {
        try {
            let filePath = null;
            let isReplyToMedia = false;
            let email = '';
            let subject = '';
            let msg = '';

            console.log('Step 1: Checking if the message is a reply to any media.');

            // Check if the message is a reply to any media (image, video, document, etc.)
            if (m.quoted) {
                const media = m.quoted;
                console.log('Step 2: Message is a reply. Checking media type...');

                // Handle image files
                if (media.mtype === 'imageMessage') {
                    console.log('Step 3: Media is an image. Proceeding to handle image...');
                    // Prepare email content for image
                    email = text.trim();  // Take the email provided in the text
                    subject = 'Your image from WhatsApp';  // Default subject for images
                    msg = `Here is the image: **${media.fileName}**`;  // File name as the message body

                    // Download the image
                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    if (!mediaBuffer) {
                        console.log('Error: Media buffer is empty.');
                        return client.reply(m.chat, 'Error downloading the media. Please try again.', m);
                    }

                    const imagePath = path.join(__dirname, media.fileName);
                    fs.writeFileSync(imagePath, mediaBuffer);  // Save the image locally
                    filePath = imagePath;  // Save the file path

                    isReplyToMedia = true;
                    console.log(`Step 4: Image downloaded and saved as ${filePath}`);
                }
                // Handle document files (same approach for documents as before)
                else if (media.mtype === 'document') {
                    console.log('Step 5: Media is a document. Downloading...');
                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    if (!mediaBuffer) {
                        console.log('Error: Media buffer is empty.');
                        return client.reply(m.chat, 'Error downloading the media. Please try again.', m);
                    }

                    const mimeType = media.mimetype || '';
                    const extname = mimeType.split('/')[1];
                    const fileName = media.fileName || 'document';
                    filePath = path.join(__dirname, `${fileName}.${extname}`);
                    fs.writeFileSync(filePath, mediaBuffer);
                    console.log(`Step 6: Document downloaded and saved as ${filePath}`);

                    isReplyToMedia = true;
                }
            }

            // If it's a media reply, skip asking for email | subject | message
            if (isReplyToMedia) {
                console.log('Step 7: Reply to media detected. Preparing to send email...');

                // If no text input is provided, prompt user for email
                if (!text) {
                    console.log('Step 8: No email input for media reply. Prompting user...');
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email'), m);
                }

                email = text.trim();
                subject = 'Your media from WhatsApp';
                msg = `Here is the media: **${path.basename(filePath)}**`;  // Include the file name in the message body

                console.log(`Step 9: Email: ${email}, Subject: ${subject}, Message: ${msg}`);
            } else {
                // This is where we handle text inputs (not media replies)
                console.log(`Step 10: Received text: ${text}`);
                if (!text) {
                    console.log('Step 11: No text input provided. Prompting user for email, subject, and message...');
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                }

                // Process text input for email | subject | message
                const [providedEmail, inputSubject, inputMsg] = text.split('|').map(str => str.trim());
                if (!providedEmail || !inputSubject || !inputMsg) {
                    console.log('Step 12: Missing email, subject, or message in input. Prompting user...');
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                }

                email = providedEmail;
                subject = inputSubject;
                msg = inputMsg;

                console.log(`Step 13: Email: ${email}, Subject: ${subject}, Message: ${msg}`);
            }

            // Set up the transporter for sending email
            console.log('Step 14: Setting up transporter for email...');
            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'notifications@lucifercloud.app',
                    pass: 'Hiba@marijan09'
                }
            });

            let attachments = [];
            if (filePath) {
                // For media (image or document) files, attach the file to the email
                const extname = path.extname(filePath).toLowerCase();
                body = `Your media from WhatsApp\n\nFile: **${path.basename(filePath)}**`;
                attachments = [{
                    filename: path.basename(filePath),
                    path: filePath,
                }];
                console.log('Step 15: Media attached to email:', filePath);
            }

            console.log('Step 16: Sending email...');
            // Set up the email options
            const mailOptions = {
                from: {
                    name: 'Lucifer - MD (WhatsApp Bot)',
                    address: 'notifications@lucifercloud.app'
                },
                to: email,
                subject: subject,
                text: msg,
                attachments: attachments
            };

            // Send the email
            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.error('Step 17: Error sending email:', err);
                    client.reply(m.chat, Func.texted('bold', `❌ Error sending email to ${email}`), m);
                } else {
                    console.log('Step 18: Email sent:', data.response);
                    client.reply(m.chat, `✅ Successfully sent email`, m);
                }

                // Clean up the temporary file if one was downloaded
                if (filePath) {
                    fs.unlinkSync(filePath);
                    console.log('Step 19: Temporary file deleted:', filePath);
                }
            });
        } catch (e) {
            console.error('Step 20: Error during processing:', e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    __filename
};
