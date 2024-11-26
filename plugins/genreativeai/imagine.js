const { exec } = require('child_process');

const models = {
    'dreamshaperXL': 'dreamshaperXL10_alpha2.safetensors [c8afe2ef]',
    'dynavisionXL': 'dynavisionXL_0411.safetensors [c39cc051]',
    'juggernautXL': 'juggernautXL_v45.safetensors [e75f5471]',
    'realismEngineSDXL': 'realismEngineSDXL_v10.safetensors [af771c3f]',
    'sd_xl_base': 'sd_xl_base_1.0.safetensors [be9edd61]',
    'sd_xl_inpainting': 'sd_xl_base_1.0_inpainting_0.1.safetensors [5679a81a]',
    'turbovisionXL': 'turbovisionXL_v431.safetensors [78890989]'
};

exports.run = {
    usage: ['generate'],
    category: 'generativeai',
    async: async (m, { client, text, command }) => {
        try {
            if (!text) {
                return client.reply(m.chat, 'Please provide a prompt. Example: /generate "your prompt here"', m);
            }

            client.sendReact(m.chat, '🕒', m.key);

            // Array to store the image results from all models
            const imageResults = [];

            // Loop through all models and generate images
            for (let modelKey in models) {
                await handleModelGeneration(modelKey, text, client, m, imageResults);
            }

            // Once all jobs are completed, send the images as a carousel
            const cards = imageResults.map((result, index) => ({
                header: {
                    imageMessage: {
                        url: result.imageUrl, // Image URL from the generation result
                        caption: `Image generated with ${result.model} model.`
                    },
                    hasMediaAttachment: true,
                },
                body: {
                    text: `Prompt: ${text}`
                },
                nativeFlowMessage: {
                    buttons: []  // Removed the button for contact owner
                }
            }));

            // Send the carousel with all the images
            client.sendCarousel(m.chat, cards, m, {
                content: 'Here are the images generated for your prompt!'
            });

        } catch (e) {
            console.error('Error:', e);
            return client.reply(m.chat, 'An error occurred. Please try again later.', m);
        }
    },
    error: false,
    limit: true,
    premium: true,
    verified: true,
    location: __filename,
};

const handleModelGeneration = async (modelKey, promptText, client, message, imageResults) => {
    const model = models[modelKey];
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "${model}",
            "prompt": "${promptText}",
            "negative_prompt": "badly drawn",
            "style_preset": "cinematic",
            "steps": 20,
            "cfg_scale": 7,
            "seed": -1,
            "sampler": "DPM++ 2M Karras",
            "width": 1024,
            "height": 1024
        }'`;

    exec(curlPostCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return client.reply(message.chat, `Failed to initiate image generation for ${modelKey}. Please try again.`, message);
        }

        handleImageResponse(stdout, client, message, promptText, modelKey, imageResults);
    });
};

const handleImageResponse = (stdout, client, message, promptText, modelKey, imageResults) => {
    let postResponse;
    try {
        postResponse = JSON.parse(stdout);
    } catch (parseError) {
        console.error(`JSON parse error: ${parseError}`);
        return client.reply(message.chat, 'Error processing server response.', message);
    }

    const jobId = postResponse.job;
    client.reply(message.chat, `Image generation for ${modelKey} is in progress...`);

    const pollStatus = async () => {
        try {
            const curlStatusCommand = `curl --request GET \
                --url https://api.prodia.com/v1/job/${jobId} \
                --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
                --header 'accept: application/json'`;

            exec(curlStatusCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return client.reply(message.chat, 'Failed to fetch job status. Please try again.', message);
                }

                let statusResponse;
                try {
                    statusResponse = JSON.parse(stdout);
                } catch (parseError) {
                    console.error(`JSON parse error: ${parseError}`);
                    return client.reply(message.chat, 'Error processing status response.', message);
                }

                const status = statusResponse.status;
                if (status === 'succeeded') {
                    const imageUrl = statusResponse.imageUrl;
                    imageResults.push({
                        model: modelKey,
                        imageUrl: imageUrl
                    });
                    if (imageResults.length === Object.keys(models).length) {
                        // Send all images in a carousel once all jobs are completed
                        client.sendCarousel(message.chat, buildCarouselCards(imageResults), message);
                    }
                } else if (status === 'failed') {
                    client.reply(message.chat, `Image generation failed for ${modelKey}. Please try again.`, message);
                } else {
                    setTimeout(pollStatus, 9000);
                }
            });
        } catch (e) {
            client.reply(message.chat, 'Error fetching job status.', message);
        }
    };

    pollStatus();
};

const buildCarouselCards = (imageResults) => {
    return imageResults.map((result) => ({
        header: {
            imageMessage: {
                url: result.imageUrl, // Image URL from the generation result
                caption: `Image generated with ${result.model} model.`
            },
            hasMediaAttachment: true,
        },
        body: {
            text: `Prompt: ${result.prompt}`
        },
        nativeFlowMessage: {
            buttons: []  // No buttons now
        }
    }));
};
