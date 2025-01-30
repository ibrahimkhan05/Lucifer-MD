const { exec } = require('child_process');
const path = require('path');

exports.run = {
    usage: ['bingimg'],
    use: 'query',
    category: 'generativeai',
    async: async (m, { client, text, Func }) => {
        if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'a cat painting in Picasso style'), m);
        }

        m.reply('Generating image, please wait...');

        const scriptPath = path.join(__dirname, 'generate_image.py'); // Path to your Python script

        console.log("Executing Python script...");
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

            // Extract JSON part using a regular expression
            const jsonMatch = stdout.match(/{.*}/);
            if (!jsonMatch) {
                return m.reply('Failed to find valid JSON in the output.');
            }

            let data;
            try {
                // Parse the JSON part of the output
                data = JSON.parse(jsonMatch[0]);
            } catch (err) {
                console.error("Failed to parse image data:", err);
                return m.reply(`Failed to parse image data. Raw output: ${stdout}`);
            }

            if (!data.images || data.images.length === 0) {
                return client.reply(m.chat, 'No images found.', m);
            }

            // Prepare carousel for images, ensure valid URLs
            const cards = data.images.map((image, index) => {
                if (!image.url || !image.url.startsWith('http')) {
                    console.warn(`Skipping invalid image URL: ${image.url}`);
                    return null;  // Skip invalid URLs
                }

                return {
                    header: {
                        imageMessage: {
                            url: image.url,  // Use the URL from the result
                        },
                        hasMediaAttachment: true,
                    },
                    body: {
                        text: `◦ *Prompt* : ${data.prompt}\nImage ${index + 1} of ${data.images.length}`,
                    }
                };
            }).filter(card => card !== null); // Remove null values from the array

            // Send the carousel with the generated images
            if (cards.length > 0) {
                console.log("Sending carousel with images...");
                client.sendCarousel(m.chat, cards, m, {
                    content: 'Here are your generated images:',
                });
            } else {
                console.log("No valid images to send.");
                m.reply('No valid images found.');
            }
        });
    },
    error: false,
    limit: true,
    premium: false,
    verified: true
};
