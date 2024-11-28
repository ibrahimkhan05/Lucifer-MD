const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { execFile } = require('child_process');

exports.run = {
    usage: ['mail'],
    use: 'email | subject | body',
    category: 'owner',
    owner: true,
    async: async (m, { client, args, isPrefix, text, command, Func }) => {
        try {
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
            }

            client.sendReact(m.chat, '🕒', m.key);

            const [email, subject, msg] = text.split('|').map(str => str.trim());

            // Case: Replying to text (only email is provided)
            if (m.quoted && m.quoted.text) {
                if (!email) return client.reply(m.chat, Func.example(isPrefix, command, 'email'), m);

                const transporter = nodemailer.createTransport({
                    host: 'smtp.zoho.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'notifications@lucifercloud.app',
                        pass: 'Hiba@marijan09'
                    }
                });

                const template = `
                    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif;">
                        <div style="line-height: 2; letter-spacing: 0.5px; padding: 10px; border: 1px solid #DDD; border-radius: 14px;">
                            <h3 style="margin-top: 0;">Hi <b>${m.pushName} 😘</b> Welcome to Lucifer - MD, an awesome WhatsApp Bot!</h3>
                            <br><br>${m.quoted.text}<br><br>
                            If you have any problem, please contact via <span style="color: #4D96FF;"><a href="https://api.whatsapp.com/send?phone=923229931076">WhatsApp</a></span><br>
                            <span>Regards,<br>Ibrahim</span>
                        </div>
                    </div>
                `;

                const mailOptions = {
                    from: {
                        name: 'Lucifer - MD (WhatsApp Bot)',
                        address: 'notifications@lucifercloud.app'
                    },
                    to: email,
                    subject: 'Lucifer MD: Message from ' + m.pushName,
                    html: template
                };

                transporter.sendMail(mailOptions, function(err, data) {
                    if (err) {
                        console.error(err);
                        client.reply(m.chat, Func.texted('bold', `❌ Error sending email to ${email}`), m);
                    } else {
                        console.log('Email sent:', data.response);
                        client.reply(m.chat, `✅ Successfully sent email`, m);
                    }
                });
            }
            // Case: Replying to a media (file download)
            else if (m.quoted && !m.quoted.text) {
                // Download the media file (document, image, video, etc.)
                const media = await m.quoted.download();
                if (!media) {
                    return client.reply(m.chat, '❌ Failed to download the media.', m);
                }

                // Generate a random file name
                const randomFileName = Math.random().toString(36).substring(2, 8); // generates a 6-character random string
                const filePath = path.join(__dirname, 'downloads', randomFileName);

                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }

                fs.writeFileSync(filePath, media, 'base64');
                console.log(`File saved at: ${filePath}`);

                // Check the file extension using Python script or another method
                const pythonScriptPath = path.join(__dirname, 'get_extension.py');  // Path to your Python script for getting extension
                execFile('python3', [pythonScriptPath, filePath], (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error: ${error.message}`);
                        client.reply(m.chat, '❌ Error occurred while processing the file.', m);
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        return;
                    }

                    // Get the file extension from the output
                    const extension = stdout.trim();
                    const newFilePath = filePath + extension;

                    // Rename the file with the extension
                    if (fs.existsSync(filePath)) {
                        fs.renameSync(filePath, newFilePath);
                        console.log(`File renamed as: ${newFilePath}`);
                    }

                    // Email logic for file attachment
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
                        from: {
                            name: 'Lucifer - MD (WhatsApp Bot)',
                            address: 'notifications@lucifercloud.app'
                        },
                        to: email,
                        subject: subject || 'Lucifer MD: Media Attachment',
                        text: msg || 'Please find the attachment.',
                        attachments: [{
                            filename: randomFileName + extension,
                            path: newFilePath
                        }]
                    };

                    transporter.sendMail(mailOptions, function(err, data) {
                        if (err) {
                            console.error(err);
                            client.reply(m.chat, Func.texted('bold', `❌ Error sending email to ${email}`), m);
                        } else {
                            console.log('Email sent:', data.response);
                            client.reply(m.chat, `✅ Successfully sent email with the attachment`, m);
                        }

                        // After processing, delete the file after sending the email
                        if (fs.existsSync(newFilePath)) {
                            fs.unlinkSync(newFilePath);
                            console.log('File deleted after sending email.');
                        }
                    });
                });

            } 
            else {
                // Invalid format: Reply is neither text nor media
                return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);
            }
        } catch (e) {
            console.error(e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    __filename
};
