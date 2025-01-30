const { exec } = require('child_process');
const path = require('path');

exports.run = {
    usage: ['bingimg'],
    use: 'query',
    category: 'generativeai',
    async: async (m, { client, text, Func }) => {
        if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'a cat painting'), m);
        }

        m.reply('Generating images, please wait...');

        const scriptPath = path.join(__dirname, 'generate_image.py'); // Path to your Python script

        // Execute Python script to generate image
        exec(`python3 ${scriptPath} '${text}'`, async (error, stdout, stderr) => {
            if (error) {
                return m.reply('An error occurred while generating the image.');
            }

            let data;
            try {
                // Parse the JSON part of the output
                data = JSON.parse(stdout);
            } catch (err) {
                return m.reply(`Failed to parse image data. Raw output: ${stdout}`);
            }

            if (data.error) {
                return m.reply(`Error: ${data.error}`);
            }

            if (!data.images || data.images.length === 0) {
                return client.reply(m.chat, 'No images found.', m);
            }

            // Send the 1st, 3rd, 5th, and 7th images directly without saving them in separate variables
            for (let i = 0; i < 4; i++) {
                const imageIndex = i * 2; // To select 1st, 3rd, 5th, and 7th images
                const imageUrl = data.images[imageIndex]?.url + '.jpg'; // Add .jpg extension

                if (imageUrl) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

                    client.sendMessage(m.chat, {
                        image: { url: imageUrl },
                        caption: `◦  *Prompt* : ${text}\nImage ${i + 1} of 4`,
                    });
                }
            }
        });
    },
    error: false,
    limit: true,
    premium: false,
    verified: true
};
