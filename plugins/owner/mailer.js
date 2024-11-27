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

            console.log('Step 1: Checking if the message is a reply to any media.');
            
            // Check if the message is a reply to any media (image, video, document, etc.)
            if (m.quoted) {
                const media = m.quoted;
                console.log('Step 2: Message is a reply. Checking media type...');

                // Handle document files
                if (media.mtype === 'document') {
                    console.log('Step 3: Media is a document. Downloading...');
                    // Download the document
                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    const mimeType = media.mimetype || '';  // Get the mime type (e.g., application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document for docx)
                    const extname = mimeType.split('/')[1];  // Extract the file extension from mime type (e.g., pdf, docx)
                    const fileName = media.fileName || 'document';  // Default filename if not provided
                    filePath = path.join(__dirname, `${fileName}.${extname}`);  // Save with correct extension

                    // Save the media (document) to a file with the correct extension
                    fs.writeFileSync(filePath, mediaBuffer);
                    console.log(`Step 4: Document downloaded and saved as ${filePath}`);

                    // Mark that the reply is to a document (media)
                    isReplyToMedia = true;
                }
            }

            console.log('Step 5: Checking if the message is not a reply to media and processing text...');
            // If the reply is not to media, we need to require email | subject | message
            if (!isReplyToMedia) {
                if (!text) {
                    console.log('Step 6: No text input provided. Prompting user for email, subject, and message...');
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                }

                // Extract email, subject, and message from the command input
                const [providedEmail, inputSubject, inputMsg] = text.split('|').map(str => str.trim());
                if (!providedEmail || !inputSubject || !inputMsg) {
                    console.log('Step 7: Missing email, subject, or message in input. Prompting user...');
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                }

                email = providedEmail;  // Assign email here
                subject = inputSubject;
                msg = inputMsg;

                console.log(`Step 8: Email: ${email}, Subject: ${subject}, Message: ${msg}`);
            } else {
                console.log('Step 9: Reply is to a document. Preparing email with default subject and message...');
                // If it's a reply to media (document), use default subject and message
                if (!text) {
                    console.log('Step 10: No text input for email. Prompting user...');
                    return client.reply(m.chat, Func.example(isPrefix, command, 'email'), m);
                }

                email = text.trim();  // Assign email here for media reply
                subject = 'Your document from WhatsApp';  // Default subject for documents
                msg = `Here is the document: **${path.basename(filePath)}**`;  // Document filename in the message body
                console.log(`Step 11: Email: ${email}, Subject: ${subject}, Message: ${msg}`);
            }

            // Set up the transporter for sending email
            console.log('Step 12: Setting up transporter for email...');
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
                console.log('Step 13: Document attached to email:', filePath);
            }

            console.log('Step 14: Sending email...');
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
                    console.error('Step 15: Error sending email:', err);
                    client.reply(m.chat, Func.texted('bold', `❌ Error sending email to ${email}`), m);
                } else {
                    console.log('Step 16: Email sent:', data.response);
                    client.reply(m.chat, `✅ Successfully sent email`, m);
                }

                // Clean up the temporary file if one was downloaded
                if (filePath) {
                    fs.unlinkSync(filePath);
                    console.log('Step 17: Temporary file deleted:', filePath);
                }
            });
        } catch (e) {
            console.error('Error during processing:', e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    __filename
};
