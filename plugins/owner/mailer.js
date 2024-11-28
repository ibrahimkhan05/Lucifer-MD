const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const nodemailer = require('nodemailer');

// Function to get file extension
async function getFileExtension(filePath) {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, 'get_extension.py');
        execFile('python3', [pythonScriptPath, filePath], (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return reject('❌ Error occurred while processing the file.');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return reject('❌ Error occurred while processing the file.');
            }
            const extension = stdout.trim();
            resolve(extension);
        });
    });
}

// Mail sending function
async function sendEmail(email, attachmentPath = null) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: 'notifications@lucifercloud.app',
            pass: 'Hiba@marijan09'
        }
    });

    let mailOptions = {
        from: {
            name: 'Lucifer - MD (WhatsApp Bot)',
            address: 'notifications@lucifercloud.app'
        },
        to: email,
        subject: 'Your Requested File',
        html: `<div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="line-height: 2; letter-spacing: 0.5px; padding: 10px; border: 1px solid #DDD; border-radius: 14px;">
                        <h3 style="margin-top: 0;">Hi <b>${m.pushName} 😘</b>!</h3>
                        <br><br>Your requested file is attached.<br><br>
                        If you have any problem, please contact via <span style="color: #4D96FF;"><a href="https://api.whatsapp.com/send?phone=923229931076">WhatsApp</a></span><br>
                        <span>Regards,<br>Ibrahim</span>
                    </div>
                </div>`
    };

    // Add attachment if available
    if (attachmentPath) {
        mailOptions.attachments = [
            {
                path: attachmentPath
            }
        ];
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.error(err);
                reject('❌ Error sending email.');
            } else {
                console.log('Email sent:', data.response);
                resolve('✅ Successfully sent email');
            }
        });
    });
}

exports.run = {
    usage: ['mail'],
    use: 'reply with any media to send it via email',
    category: 'owner',
    owner: true,
    async: async (m, { client, args, isPrefix, text, command, Func }) => {
        try {
            // If the user replies with media (audio, video, voice, or document)
            if (m.quoted && !m.quoted.text) {
                // Download the media file (could be document, audio, video, etc.)
                const media = await m.quoted.download();
                if (!media) {
                    return client.reply(m.chat, '❌ Failed to download the media.', m);
                }

                // Generate a random file name
                const randomFileName = Math.random().toString(36).substring(2, 8); // generates a 6-character random string
                const filePath = path.join(__dirname, 'downloads', randomFileName);

                // Ensure the 'downloads' folder exists
                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }

                // Save the media to the file
                fs.writeFileSync(filePath, media, 'base64');
                console.log(`File saved at: ${filePath}`);

                // Get the file extension
                const extension = await getFileExtension(filePath);

                // Rename the file to include its extension
                const newFilePath = filePath + extension;
                fs.renameSync(filePath, newFilePath);

                // Send email with the file as attachment
                const emailStatus = await sendEmail(m.sender, newFilePath);
                client.reply(m.chat, emailStatus, m);

                // Delete the file after sending email
                if (fs.existsSync(newFilePath)) {
                    fs.unlinkSync(newFilePath);
                    console.log('File deleted after email sent.');
                }

            } else {
                // If the message is text-based, respond with a message (media file required)
                client.reply(m.chat, '❌ Please reply to a media file (document, image, video, etc.) to send via email.', m);
            }

        } catch (e) {
            console.log(e);
            client.reply(m.chat, '❌ Error processing the file. Please try again.', m);
        }
    },
    error: false,
    limit: true,
    restrict: true,
    cache: true,
    location: __filename
};
