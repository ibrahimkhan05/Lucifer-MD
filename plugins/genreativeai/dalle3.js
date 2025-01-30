const { exec } = require('child_process');
const path = require('path');

exports.run = {
    usage: ['bingart'],
    use: 'query',
    category: 'generativeai',
    async: async (m, { client, text, Func }) => {
        if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'a cat painting in Picasso style'), m);
        }
        
        m.reply('Generating image, please wait...');
        
        const scriptPath = path.join(__dirname, 'generate_image.py');

        // Execute Python script to generate image
        exec(`python3 ${scriptPath} '${text}'`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return m.reply('An error occurred while generating the image.');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            
            let data;
            try {
                data = JSON.parse(stdout);
            } catch (err) {
                return m.reply('Failed to parse image data.');
            }
            
            if (!data.images || data.images.length === 0) {
                return client.reply(m.chat, 'No images found.', m);
            }
            
            // Prepare carousel for images
            const cards = data.images.map((image, index) => ({
                header: {
                    imageMessage: image.url,
                    hasMediaAttachment: true,
                },
                body: {
                    text: `◦ *Prompt* : ${data.prompt}\nImage ${index + 1} of ${data.images.length}`,
                }
            }));
            
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
