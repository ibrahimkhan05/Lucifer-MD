const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

exports.run = {
    usage: ['mail'],
    use: 'email | subject | message',
    category: 'owner',
    owner: true,
    async: async (m, { client, args, isPrefix, text, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);

            client.sendReact(m.chat, '🕒', m.key);

            const [email, subject, msg] = text.split('|').map(str => str.trim());
            if (!email || !subject || !msg) return client.reply(m.chat, Func.example(isPrefix, command, 'email | subject | message'), m);

            let filePath = null;
            // Check if the user is replying to any media
            if (m.quoted && (m.quoted.mtype === 'document' || m.quoted.mtype === 'image' || m.quoted.mtype === 'video' || m.quoted.mtype === 'audio')) {
                const media = m.quoted;
                const fileUrl = media.download;

                // Download the media file (image, video, document, audio, etc.)
                const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                const fileName = media.fileName || 'media';
                filePath = path.join(__dirname, fileName);
                fs.writeFileSync(filePath, response.data);
                console.log('Media downloaded:', filePath);
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

            const template = `
                <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="line-height: 2; letter-spacing: 0.5px; padding: 10px; border: 1px solid #DDD; border-radius: 14px;">
                        <h3 style="margin-top: 0;">Hi <b>${m.pushName}</b>, Welcome to Lucifer - MD, an awesome WhatsApp Bot!</h3>
                        <br><br>${msg}<br><br>
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
                subject: subject,
                html: template,
                attachments: filePath ? [{
                    filename: path.basename(filePath),
                    path: filePath,
                }] : [] // Attach media only if available
            };

            transporter.sendMail(mailOptions, function(err, data) {
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
