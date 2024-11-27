const axios = require('axios');

// List of 16 best models
const models = [
    "absolutereality_V16.safetensors [37db0fc3]",
    "absolutereality_v181.safetensors [3d9d4d2b]",
    "amIReal_V41.safetensors [0a8a2e61]",
    "analog-diffusion-1.0.ckpt [9ca13f02]",
    "aniverse_v30.safetensors [579e6f85]",
    "anythingv3_0-pruned.ckpt [2700c435]",
    "anything-v4.5-pruned.ckpt [65745d25]",
    "anythingV5_PrtRE.safetensors [893e49b9]",
    "AOM3A3_orangemixs.safetensors [9600da17]",
    "blazing_drive_v10g.safetensors [ca1c1eab]",
    "breakdomain_I2428.safetensors [43cc7d2f]",
    "breakdomain_M2150.safetensors [15f7afca]",
    "cetusMix_Version35.safetensors [de2f2560]",
    "childrensStories_v13D.safetensors [9dfaabcb]",
    "childrensStories_v1SemiReal.safetensors [a1c56dbb]",
    "childrensStories_v1ToonAnime.safetensors [2ec7b88b]"
];

exports.run = {
    usage: ['txt2img'],
    hidden: [],  // No need to hide models as we are using a fixed model list
    use: 'prompt',
    category: 'generativeai',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            // Step 1: If no text is provided, prompt for text
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'cat,fish'), m);
            }

            // Step 2: Select 6 random models from the 16 available models
            const selectedModels = [];
            while (selectedModels.length < 6) {
                const randomModel = models[Math.floor(Math.random() * models.length)];
                if (!selectedModels.includes(randomModel)) {
                    selectedModels.push(randomModel);
                }
            }

            // Step 3: Automatically use the selected models to generate images
            client.sendReact(m.chat, '🕒', m.key);
            const imagePromises = selectedModels.map(async (model) => {
                const requestData = {
                    prompt: text,
                    model: model,
                    steps: 25,
                    cfg_scale: 7,
                    sampler: "DPM++ 2M Karras",
                    negative_prompt: "blurry, bad quality"
                };

                // Make API request to start image generation for each model
                try {
                    const response = await axios.post('https://nexra.aryahcr.cc/api/image/complements', {
                        prompt: text,
                        model: "prodia",
                        data: requestData
                    }, {
                        headers: { 'Content-Type': 'application/json' }
                    });

                    // Get the job ID to track status
                    const jobId = response.data.id;

                    // Poll for the job status
                    let jobStatus = 'pending';
                    while (jobStatus === 'pending') {
                        const statusResponse = await axios.get(`http://nexra.aryahcr.cc/api/image/complements/${encodeURIComponent(jobId)}`);
                        jobStatus = statusResponse.data.status;

                        if (jobStatus === 'completed' || jobStatus === 'error') {
                            if (jobStatus === 'completed') {
                                const imageUrl = statusResponse.data.images[0]; // Get image URL
                                if (imageUrl) {
                                    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                                    const imageBuffer = Buffer.from(imageResponse.data);

                                    return {
                                        image: imageBuffer,
                                        text: `*Prompt*: ${text} - Model: ${model}`
                                    };
                                }
                            }
                            break;
                        }

                        // Wait a bit before polling again
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
                    }
                } catch (e) {
                    console.error('Error generating image for model', model, e);
                    return { error: true };
                }
            });

            // Wait for all image generation promises to complete
            const images = await Promise.all(imagePromises);

            // Filter out any errors
            const validImages = images.filter(img => !img.error);

            if (validImages.length > 0) {
                // Send the valid images as a carousel
                const carousel = validImages.map((img) => ({
                    header: { imageMessage: global.db.setting.cover, hasMediaAttachment: true },
                    body: { text: img.text },
                    nativeFlowMessage: { buttons: [] }, // Remove buttons as requested
                    image: img.image
                }));

                client.sendCarousel(m.chat, carousel, m, { content: 'Here are the generated images!' });
            } else {
                client.reply(m.chat, 'Error generating images', m);
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
