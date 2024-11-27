const { exec } = require('child_process');

const BEST_MODEL = 'dreamshaperXL'; // Set the best model
const models = {
    'dreamshaperXL': 'dreamshaperXL10_alpha2.safetensors [c8afe2ef]'
};

exports.run = {
    usage: ['generate'],
    category: 'generativeai',
    async: async (m, { client, text, command }) => {
        try {
            if (!text) {
                return client.reply(m.chat, `Please provide a prompt. Example: /${command} "your prompt here"`, m);
            }

            await handleModelGeneration(BEST_MODEL, text, client, m);
        } catch (e) {
            console.error('Error:', e);
            return client.reply(m.chat, 'An error occurred.', m);
        }
    },
    error: false,
    limit: true,
    premium: true,
    verified: true,
    location: __filename
};

const handleModelGeneration = async (modelKey, promptText, client, message) => {
    const model = models[modelKey];
    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "${models}",
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
            return client.reply(message.chat, `Image generation failed. Please try again.`, message);
        }

        handleImageResponse(stdout, client, message, promptText);
    });
};

const handleImageResponse = (stdout, client, message, promptText) => {
    let postResponse;
    try {
        postResponse = JSON.parse(stdout);
    } catch (parseError) {
        console.error(`JSON parse error: ${parseError}`);
        return client.reply(message.chat, 'Error processing server response.', message);
    }

    if (postResponse.status === 'succeeded') {
        const imageUrl = postResponse.imageUrl;
        client.sendFile(message.chat, imageUrl, '', `◦  *Prompt* : ${promptText}`, message);
    } else {
        client.reply(message.chat, 'Image generation failed. Please try again.', message);
    }
};
