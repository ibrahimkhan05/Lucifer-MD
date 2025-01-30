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

        console.log(`Script path: ${scriptPath}`);
        
        // Log the exact command being run
        const command = `python3 ${scriptPath} '${text}'`;
        console.log(`Executing command: ${command}`);

        // Execute Python script to generate image
        exec(command, async (error, stdout, stderr) => {
            console.log("Executing Python script...");

            if (error) {
                console.error(`Error: ${error.message}`);
                return m.reply('An error occurred while generating the image.');
            }
            
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }

            // Log the raw output
            console.log("Python script output:");
            console.log(stdout);

            // Extract JSON part from the stdout (assuming JSON is at the end)
            const jsonStartIndex = stdout.indexOf("{");
            const jsonString = stdout.substring(jsonStartIndex);

            let data;
            try {
                // Parse the cleaned-up JSON string
                data = JSON.parse(jsonString);
                console.log("Parsed image data:", data);
            } catch (err) {
                console.error('Failed to parse image data:', err);
                return m.reply('Failed to parse image data.');
            }

            if (!data.images || data.images.length === 0) {
                console.log("No images found.");
                return client.reply(m.chat, 'No images found.', m);
            }

            // Log image data
            console.log("Found images:", data.images);

            // Prepare carousel for images
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
            console.log("Sending carousel with images...");
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
