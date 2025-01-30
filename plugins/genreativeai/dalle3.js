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

            // Select the 1st, 3rd, 5th, and 7th images and add .jpg extension
            const selectedImages = [
                data.images[0]?.url + '.jpg',  // 1st image
                data.images[2]?.url + '.jpg',  // 3rd image
                data.images[4]?.url + '.jpg',  // 5th image
                data.images[6]?.url + '.jpg'   // 7th image
            ];

            // Prepare carousel cards for sending the images
            const cards = selectedImages.map((imageUrl, index) => ({
                header: {
                    imageMessage: {
                        url: imageUrl,  // Use the image URL
                    },
                    hasMediaAttachment: true,
                },
                body: {
                    text: `◦  *Prompt* : ${text}\nImage ${index + 1} of 4`,
                },
                nativeFlowMessage: {
                    buttons: []
                }
            }));

            // Send carousel with the prepared cards
            if (cards.length > 0) {
                client.sendCarousel(m.chat, cards, m, {
                    content: 'Here are your generated images:',
                });
            } else {
                m.reply('No valid images found.');
            }
        });
    },
    error: false,
    limit: true,
    premium: false,
    verified: true
};
