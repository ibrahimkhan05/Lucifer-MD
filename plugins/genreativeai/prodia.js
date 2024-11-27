const axios = require('axios');

// Predefined best model to use
const bestModel = "absolutereality_V16.safetensors [37db0fc3]";

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
            const requestData = {
                prompt: text,
                model: model,
                steps: 25,
                cfg_scale: 7,
                sampler: "DPM++ 2M Karras",
                negative_prompt: "blurry, bad quality"  // Fixed typo "blury" to "blurry"
            };

            // Make API request to start image generation
            const response = await axios.post('https://nexra.aryahcr.cc/api/image/complements', {
                prompt: text,
                model: "prodia",
                data: {
                    model: model,
                    steps: 25,
                    cfg_scale: 7,
                    sampler: "DPM++ 2M Karras",
                    negative_prompt: ""  // You can customize the negative prompt here if needed
                }
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Get the job ID to track status
            const jobId = response.data.id;

            // Poll for the job status
            let jobStatus = 'pending';
            while (jobStatus === 'pending') {
                const statusResponse = await axios.get(`http://nexra.aryahcr.cc/api/image/complements/${encodeURIComponent(jobId)}`);
                jobStatus = statusResponse.data.status;

                // Log the status response for debugging
                console.log('Job status response:', statusResponse.data);

                // Check the status and break if completed or errored
                if (jobStatus === 'completed' || jobStatus === 'error') {
                    if (jobStatus === 'completed') {
                        const imageUrl = statusResponse.data.images[0]; // Get image URL

                        // Check if the image URL exists
                        if (imageUrl) {
                            // Download the image from the URL
                            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                            const imageBuffer = Buffer.from(imageResponse.data);

                            // Send the image to the user
                            client.sendFile(m.chat, imageBuffer, 'image.jpg', `*Prompt*: ${text}`, m);
                        } else {
                            client.reply(m.chat, 'Image URL not found or invalid', m);
                        }
                    } else {
                        client.reply(m.chat, 'Error generating image', m);
                    }
                    break;
                }
                // Wait a bit before polling again
                await new Promise(resolve => setTimeout(resolve, 5000));  // Poll every 5 seconds
            }

        } catch (e) {
            console.error('Error:', e);
            client.reply(m.chat, 'An error occurred while generating the image', m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    premium: true,
    verified: true,
    location: __filename
};
