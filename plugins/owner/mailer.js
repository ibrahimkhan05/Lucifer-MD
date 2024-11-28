const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { execFile } = require('child_process');

async function sendEmail(m, email, filePath) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 587,
            secure: false,
            auth: {
                user: 'notifications@lucifercloud.app',
                pass: 'Hiba@marijan09'
            }
        });

        // Define the email template
        const template = `
            <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="line-height: 2; letter-spacing: 0.5px; padding: 10px; border: 1px solid #DDD; border-radius: 14px;">
                    <h3 style="margin-top: 0;">Hi <b>${m.pushName} 😘</b>, Welcome to Lucifer - MD, an awesome WhatsApp Bot!</h3>
                    <br><br>
                    Please find the attached file. <br><br>
                    If you have any problems, please contact us via <span style="color: #4D96FF;"><a href="https://api.whatsapp.com/send?phone=923229931076">WhatsApp</a></span><br>
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
            subject: 'File from Lucifer - MD',
            html: template,
            attachments: [
                {
                    filename: path.basename(filePath),
                    path: filePath
                }
            ]
        };

        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                console.error('Error sending email:', err);
                return m.client.reply(m.chat, '❌ Error sending email.', m);
            } else {
                console.log('Email sent:', data.response);
                m.client.reply(m.chat, `✅ Successfully sent email to ${email}`, m);
            }
        });
    } catch (err) {
        console.error('Error in sendEmail function:', err);
        m.client.reply(m.chat, '❌ Error processing the email.', m);
    }
}

exports.run = {
    usage: ['mail'],
    async: async (m, { client, args, text, isPrefix, command, Func }) => {
        try {
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'email'), m);
            }

            // Check if the message is a media reply
            let media;
            if (m.quoted && !m.quoted.text) {
                media = await m.quoted.download();
            } else {
                return client.reply(m.chat, '❌ Please reply to a media file (document, image, video, etc.) to send it via email.', m);
            }

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

            // Get the file extension by running the Python script
            const pythonScriptPath = path.join(__dirname, 'get_extension.py');
            execFile('python3', [pythonScriptPath, filePath], (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return client.reply(m.chat, '❌ Error occurred while processing the file.', m);
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }

                const extension = stdout.trim();
                console.log(`File extension: ${extension}`);

                // Add extension to the file
                const newFileName = filePath + extension;
                if (fs.existsSync(filePath)) {
                    fs.renameSync(filePath, newFileName);
                    console.log(`File saved as: ${newFileName}`);
                }

                // Send the email
                sendEmail(m, args[0], newFileName);

                // Clean up: Delete the file after processing
                if (fs.existsSync(newFileName)) {
                    fs.unlinkSync(newFileName);
                    console.log('File deleted after sending email.');
                }
            });

        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, '❌ Error processing the file. Please try again.', m);
        }
    },
    error: false,
    limit: true,
    restrict: true,
    cache: true,
    location: __filename
};
