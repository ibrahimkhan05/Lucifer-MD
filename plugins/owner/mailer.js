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
            let email = '';  // Initialize email variable here
            let subject = '';
            let msg = '';

            // Check if the message is a reply to any media (image, video, document, etc.)
            if (m.quoted) {
                const media = m.quoted;
                // Handle document files
                if (media.mtype === 'document') {
                    // Download the document
                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    const mimeType = media.mimetype || '';  // Get the mime type (e.g., application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document for docx)
                    const extname = mimeType.split('/')[1];  // Extract the file extension from mime type (e.g., pdf, docx)
                    const fileName = media.fileName || 'document';  // Default filename if not provided
                    filePath = path.join(__dirname, `${fileName}.${extname}`);  // Save with correct extension

                    // Save the media (document) to a file with the correct extension
                    fs.writeFileSync(filePath, mediaBuffer);
                    console.log('Document downloaded:', filePath);

                    // Mark that the reply is to a document (media)
                    isReplyToMedia = true;
                }
            }

            // If the reply is not to media, we need to require email | subject | message
            if (!isReplyToMedia) {
                if (!text) {
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                }

                // Extract email, subject, and message from the command input
                const [providedEmail, inputSubject, inputMsg] = text.split('|').map(str => str.trim());
                if (!providedEmail || !inputSubject || !inputMsg) {
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                }

                email = providedEmail;  // Assign email here
                subject = inputSubject;
                msg = inputMsg;
            } else {
                // If it's a reply to media (document), use default subject and message
                if (!text) {
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email'), m);
                }

                email = text.trim();  // Assign email here for media reply
                subject = 'Your document from WhatsApp';  // Default subject for documents
                msg = `Here is the document: **${path.basename(filePath)}**`;  // Document filename in the message body
            }

            // Set up the transporter for sending email
            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'notifications@lucifercloud.app',
                    pass: 'Hiba@marijan09'
                }
            });

            // Prepare the email body and attachments
            let body = msg;
            let attachments = [];

            if (filePath) {
                // For document files, send the file as an attachment
                const extname = path.extname(filePath).toLowerCase();  // Extract the file extension from path
                body = `Your document from WhatsApp\n\nFile: **${path.basename(filePath)}**`;  // Plain text with bold filename
                attachments = [{
                    filename: path.basename(filePath),
                    path: filePath,
                }];
            }

            // Set up the email options
            const mailOptions = {
                from: {
                    name: 'Lucifer - MD (WhatsApp Bot)',
                    address: 'notifications@lucifercloud.app'
                },
                to: email,
                subject: subject,
                text: body,  // Send plain text for document files
                attachments: attachments
            };

            // Send the email
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
