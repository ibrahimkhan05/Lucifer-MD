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
            let subject = '';
            let msg = '';

            // Check if the message is a reply to any media (image, video, document, etc.)
            if (m.quoted) {
                const media = m.quoted;
                if (media.mtype === 'imageMessage' || media.mtype === 'videoMessage' || media.mtype === 'document' || media.mtype === 'audioMessage') {
                    // Download the media message
                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    const fileName = media.fileName || 'media.' + media.mtype.split('Message')[0].toLowerCase();  // Set a default file extension
                    filePath = path.join(__dirname, fileName);

                    // Save the media to a file
                    fs.writeFileSync(filePath, mediaBuffer);
                    console.log('Media downloaded:', filePath);

                    // If it's a media reply, set `isReplyToMedia` to true and only require email
                    isReplyToMedia = true;
                }
            }

            if (!isReplyToMedia) {
                // If not replying to media, we require the user to provide email | subject | message
                if (!text) {
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                }

                // Extract email, subject, and message from the command input
                const [email, inputSubject, inputMsg] = text.split('|').map(str => str.trim());
                if (!email || !inputSubject || !inputMsg) {
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                }

                subject = inputSubject;
                msg = inputMsg;
            } else {
                // If it's a reply to media, use the default subject and message
                subject = 'Your document from WhatsApp';  // Default subject for documents
                msg = `Here is the document: <b>${path.basename(filePath)}</b>`;
            }

            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'notifications@lucifercloud.app',
                    pass: 'Hiba@marijan09'
                }
            });

            // Check if the file is a document and adjust the body formatting
            let body = msg;
            let attachments = [];

            if (filePath) {
                const extname = path.extname(filePath).toLowerCase();
                // For document files, send the file with a bold name in the body, no HTML design
                if (extname === '.pdf' || extname === '.docx' || extname === '.txt') {
                    body = `Your document from WhatsApp\n\nFile: **${path.basename(filePath)}**`;
                    attachments = [{
                        filename: path.basename(filePath),
                        path: filePath,
                    }];
                } else {
                    // For other media types (e.g., image, video), include them as attachments
                    attachments = [{
                        filename: path.basename(filePath),
                        path: filePath,
                    }];
                }
            }

            const mailOptions = {
                from: {
                    name: 'Lucifer - MD (WhatsApp Bot)',
                    address: 'notifications@lucifercloud.app'
                },
                to: email,
                subject: subject,
                html: isReplyToMedia ? body : body,  // Send HTML formatted message for media
                attachments: attachments
            };

            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.error(err);
                    client.reply(m.chat, Func.texted('bold', `❌ Error sending email to ${email}`), m);
                } else {
                    console.log('Email sent:', data.response);
                    client.reply(m.chat, `✅ Successfully sent email`, m);
                }

                // Clean up the temporary file if one was downloaded
                if (filePath) {
                    fs.unlinkSync(filePath);
                    console.log('Temporary file deleted');
                }
            });
        } catch (e) {
            console.error(e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    __filename
};
