const { prodia } = require("gpti");

// Predefined best model to use
const bestModel = "Realistic_Vision_V5.0.safetensors [614d1063]";

exports.run = {
    usage: ['txt2img'],
    hidden: [],  // No need to hide models as we are using one fixed model
    use: 'prompt',
    category: 'generativeai',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            // Step 1: If no text is provided, prompt for text
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'cat,fish'), m);
            }

            // Step 2: Automatically use the best model and generate the image
            client.sendReact(m.chat, '🕒', m.key);

            const model = bestModel;
            const data_js = {
                prompt: text,
                data: {
                    model: model,
                    steps: 25,
                    cfg_scale: 7,
                    sampler: "DPM++ 2M Karras",
                    negative_prompt: "blurry, bad quality"  // Fixed typo "blury" to "blurry"
                }
            };

            // Call the API to generate the image
            prodia.v1(data_js, (err, data) => {
                if (err) {
                    console.log(err);
                    return client.reply(m.chat, 'Error generating image', m);
                }

                if (data.status && data.images && data.images.length > 0) {
                    const base64Image = data.images[0];
                    const imageBuffer = Buffer.from(base64Image.split(",")[1], 'base64');
                    client.sendFile(m.chat, imageBuffer, 'image.jpg', `*Prompt*: ${text}`, m);
                } else {
                    client.reply(m.chat, 'No image data received', m);
                }
            });
        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
