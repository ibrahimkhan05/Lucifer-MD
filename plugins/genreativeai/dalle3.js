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
                console.error(`Error: ${error.message}`);
                return m.reply('An error occurred while generating the image.');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }

            console.log("Python script output:", stdout); // Log raw output for debugging

            let data;
            try {
                // Parse the JSON part of the output
                data = JSON.parse(stdout);
            } catch (err) {
                console.error("Failed to parse image data:", err);
                return m.reply(`Failed to parse image data. Raw output: ${stdout}`);
            }

            if (data.error) {
                return m.reply(`Error: ${data.error}`);
            }

            if (!data.images || data.images.length === 0) {
                return client.reply(m.chat, 'No images found.', m);
            }

            // Prepare cards for the carousel
            const cards = data.images.map((image, index) => ({
                header: {
                    imageMessage: {
                        url: image.url,  // Use the URL from the result
                    },
                    hasMediaAttachment: true,
                },
                body: {
                    text: `◦ *Prompt* : ${data.prompt}\nImage ${index + 1} of ${data.images.length}`,
                }
            }));

            // Send the carousel with the generated images
            client.sendCarousel(m.chat, cards, m, {
                content: 'Here are your generated images:',
            });
        });
    },
    error: false,
    limit: true,
    premium: false,
    verified: true
};
