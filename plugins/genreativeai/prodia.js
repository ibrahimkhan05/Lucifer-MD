const { exec } = require('child_process');

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
    hidden: [],
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
            console.log('Generating images for models:', selectedModels);

            const jobIds = []; // Store job IDs for each model

            selectedModels.forEach((model) => {
                const curlCommand = `curl --request POST \
                    --url https://api.prodia.com/v1/sd/generate \
                    --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
                    --header 'accept: application/json' \
                    --header 'content-type: application/json' \
                    --data '{
                        "model": "${model}",
                        "prompt": "${text}",
                        "negative_prompt": "badly drawn",
                        "steps": 25,
                        "style_preset": "cinematic",
                        "cfg_scale": 7,
                        "seed": -1,
                        "upscale": true,
                        "sampler": "DPM++ 2M Karras",
                        "width": 512,
                        "height": 512
                    }'`;

                try {
                    // Step 4: Execute cURL request to generate the image and get job ID
                    console.log(`Sending generation request for model: ${model}`);
                    exec(curlCommand, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error generating image for model: ${model}`, error);
                        } else {
                            const response = JSON.parse(stdout);
                            const jobId = response.job;
                            console.log(`Generation started for model: ${model}, Job ID: ${jobId}`);
                            jobIds.push(jobId); // Store the job ID
                        }
                    });
                } catch (e) {
                    console.error(`Error generating image for model: ${model}`, e);
                }
            });

            // Step 5: Wait for 20 seconds (assuming the images will be ready by then)
            setTimeout(async () => {
                // Generate image URLs after 20 seconds
                const img1 = `https://images.prodia.xyz/${jobIds[0]}.png`;
                const img2 = `https://images.prodia.xyz/${jobIds[1]}.png`;
                const img3 = `https://images.prodia.xyz/${jobIds[2]}.png`;
                const img4 = `https://images.prodia.xyz/${jobIds[3]}.png`;
                const img5 = `https://images.prodia.xyz/${jobIds[4]}.png`;
                const img6 = `https://images.prodia.xyz/${jobIds[5]}.png`;

                // Create cards for each image
                const cards = jobIds.map((jobId, index) => ({
                    header: {
                        imageMessage: { url: `https://images.prodia.xyz/${jobId}.png` },
                        hasMediaAttachment: true,
                    },
                    body: {
                        text: `Model: ${selectedModels[index]}`,
                    },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: 'View Image',
                                url: `https://images.prodia.xyz/${jobId}.png`,
                                webview_presentation: null
                            })
                        }]
                    }
                }));

                // Send carousel of generated images
                console.log('Sending carousel of generated images');
                if (cards.length > 0) {
                    client.sendCarousel(m.chat, cards, m, { content: 'Here are the generated images!' });
                } else {
                    client.reply(m.chat, 'Error generating images', m);
                }
            }, 20000); // Wait for 20 seconds before fetching the images
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
