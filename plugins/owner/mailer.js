const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // For random name generation

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

                // Handle image files
                if (media.mtype === 'imageMessage') {
                    console.log('Step 3: Media is an image. Proceeding to handle image...');
                    randomFileName = crypto.randomBytes(8).toString('hex') + '.jpg';
                    email = text.trim();
                    subject = 'Your image from WhatsApp';
                    msg = `Here is the image: **${randomFileName}**`;

                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    if (!mediaBuffer) {
                        console.log('Error: Media not found or could not be downloaded.');
                        return client.reply(m.chat, '❌ Failed to download the image.', m);
                    }

                    filePath = path.join(__dirname, randomFileName);
                    fs.writeFileSync(filePath, mediaBuffer);
                }
                // Handle video files
                else if (media.mtype === 'videoMessage') {
                    console.log('Step 4: Media is a video. Proceeding to handle video...');
                    randomFileName = crypto.randomBytes(8).toString('hex') + '.mp4';
                    email = text.trim();
                    subject = 'Your video from WhatsApp';
                    msg = `Here is the video: **${randomFileName}**`;

                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    if (!mediaBuffer) {
                        console.log('Error: Media not found or could not be downloaded.');
                        return client.reply(m.chat, '❌ Failed to download the video.', m);
                    }

                    filePath = path.join(__dirname, randomFileName);
                    fs.writeFileSync(filePath, mediaBuffer);
                }
                // Handle audio files
                else if (media.mtype === 'audioMessage') {
                    console.log('Step 5: Media is an audio. Proceeding to handle audio...');
                    randomFileName = crypto.randomBytes(8).toString('hex') + '.mp3';
                    email = text.trim();
                    subject = 'Your audio from WhatsApp';
                    msg = `Here is the audio: **${randomFileName}**`;

                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    if (!mediaBuffer) {
                        console.log('Error: Media not found or could not be downloaded.');
                        return client.reply(m.chat, '❌ Failed to download the audio.', m);
                    }

                    filePath = path.join(__dirname, randomFileName);
                    fs.writeFileSync(filePath, mediaBuffer);
                }
                // Handle voice messages
                else if (media.mtype === 'voiceMessage') {
                    console.log('Step 6: Media is a voice message. Proceeding to handle voice message...');
                    randomFileName = crypto.randomBytes(8).toString('hex') + '.opus';
                    email = text.trim();
                    subject = 'Your voice message from WhatsApp';
                    msg = `Here is the voice message: **${randomFileName}**`;

                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    if (!mediaBuffer) {
                        console.log('Error: Media not found or could not be downloaded.');
                        return client.reply(m.chat, '❌ Failed to download the voice message.', m);
                    }

                    filePath = path.join(__dirname, randomFileName);
                    fs.writeFileSync(filePath, mediaBuffer);
                }
                // Handle document files
                else if (media.mtype === 'documentMessage') {
                    console.log('Step 7: Media is a document. Proceeding to handle document...');
                    randomFileName = media.filename;  // Use the document's name
                    email = text.trim();
                    subject = `Your document from WhatsApp`;
                    msg = `Here is the document: **${randomFileName}**`;

                    const mediaBuffer = await client.downloadMediaMessage(m.quoted);
                    if (!mediaBuffer) {
                        console.log('Error: Media not found or could not be downloaded.');
                        return client.reply(m.chat, '❌ Failed to download the document.', m);
                    }

                    filePath = path.join(__dirname, randomFileName);
                    fs.writeFileSync(filePath, mediaBuffer);
                }

                // If file was downloaded, proceed to send email
                if (filePath) {
                    // Set up the email transporter
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.zoho.com',
                        port: 587,
                        secure: false,
                        auth: {
                            user: 'notifications@lucifercloud.app',
                            pass: 'Hiba@marijan09'
                        }
                    });

                    const mailOptions = {
                        from: 'notifications@lucifercloud.app',
                        to: email,
                        subject: subject,
                        text: msg,
                        attachments: [
                            {
                                filename: randomFileName, // Attach the media with the random name
                                path: filePath // Attach the file path
                            }
                        ]
                    };

                    // Send the email
                    transporter.sendMail(mailOptions, function(err, data) {
                        if (err) {
                            console.error('Error sending email:', err);
                            client.reply(m.chat, '❌ Error sending email.', m);
                        } else {
                            console.log('Email sent successfully:', data.response);
                            client.reply(m.chat, `✅ Your ${media.mtype === 'documentMessage' ? 'document' : media.mtype} has been sent to your email.`, m);
                        }

                        // Clean up: remove the temporary file
                        fs.unlinkSync(filePath);
                    });
                }
            } else {
                console.log('Step 8: Not a reply to media. Proceeding to handle text input...');
                // Handle case where the message is not a reply to media (email | subject | message)
                if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
                // Proceed with sending email based on text input
                const [emailInput, subjectInput, msgInput] = text.split('|').map(str => str.trim());
                if (!emailInput || !subjectInput || !msgInput) return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);

                // Send email with text input
                const transporter = nodemailer.createTransport({
                    host: 'smtp.zoho.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'notifications@lucifercloud.app',
                        pass: 'Hiba@marijan09'
                    }
                });

                const mailOptions = {
                    from: 'notifications@lucifercloud.app',
                    to: emailInput,
                    subject: subjectInput,
                    text: msgInput
                };

                // Send the email
                transporter.sendMail(mailOptions, function(err, data) {
                    if (err) {
                        console.error('Error sending email:', err);
                        client.reply(m.chat, '❌ Error sending email.', m);
                    } else {
                        console.log('Email sent successfully:', data.response);
                        client.reply(m.chat, `✅ Email sent successfully to ${emailInput}.`, m);
                    }
                });
            }
        } catch (error) {
            console.error('Error during processing:', error);
            client.reply(m.chat, '❌ An error occurred while processing your request.', m);
        }
    },
    __filename
};
