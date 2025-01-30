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

            // Prepare the images
            const images = data.images.map((image, index) => {
                let imageUrl = image.url;

                // Validate URL and add .jpg if not present
                if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                    console.warn(`Skipping invalid image URL: ${imageUrl}`);
                    return null;  // Skip invalid URLs
                }

                // Add '.jpg' if not already in the URL
                if (!imageUrl.endsWith('.jpg')) {
                    imageUrl += '.jpg';
                }

                return {
                    url: imageUrl,  // Validated URL
                    text: `◦ *Prompt* : ${data.prompt}\nImage ${index + 1} of ${data.images.length}`,
                };
            }).filter(image => image !== null); // Remove null values from the array

            // Send images one by one with a 2-second delay
            let delay = 0;  // Start from 0ms delay
            for (let i = 0; i < images.length; i++) {
                setTimeout(() => {
                    client.sendMessage(m.chat, {
                        image: { url: images[i].url },
                        caption: images[i].text,
                    }, { quoted: m });
                }, delay);
                delay += 2000;  // Add 2 seconds delay for the next image
            }
        });
    },
    error: false,
    limit: true,
    premium: false,
    verified: true
};
