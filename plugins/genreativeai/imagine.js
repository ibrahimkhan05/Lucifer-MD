const { exec } = require('child_process');

// List of models
const models = [
  "animagineXLV3_v30.safetensors [75f2f05b]",
  "devlishphotorealism_sdxl15.safetensors [77cba69f]",
  "dreamshaperXL10_alpha2.safetensors [c8afe2ef]",
  "dynavisionXL_0411.safetensors [c39cc051]",
  "juggernautXL_v45.safetensors [e75f5471]",
  "realismEngineSDXL_v10.safetensors [af771c3f]",
  "realvisxlV40.safetensors [f7fdcb51]",
  "sd_xl_base_1.0.safetensors [be9edd61]",
  "sd_xl_base_1.0_inpainting_0.1.safetensors [5679a81a]",
  "turbovisionXL_v431.safetensors [78890989]"
];

// Function to generate an image from a random model
const generateImage = async (client, m) => {
    const randomModel = models[Math.floor(Math.random() * models.length)];
    const promptText = `A beautiful scene generated with the model: ${randomModel}`;

    client.reply(m.chat, 'Generating image, please wait...', m);

    const curlPostCommand = `curl --request POST \
        --url https://api.prodia.com/v1/sdxl/generate \
        --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
        --header 'accept: application/json' \
        --header 'content-type: application/json' \
        --data '{
            "model": "${randomModel}",
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
            return client.reply(m.chat, 'Image generation failed. Please try again.', m);
        }

        try {
            const postResponse = JSON.parse(stdout);
            if (postResponse.status === 'succeeded' && postResponse.imageUrl) {
                client.sendFile(m.chat, postResponse.imageUrl, '', `◦ *Prompt* : ${promptText}`, m);
            } else {
                client.reply(m.chat, 'Image generation failed. Please try again.', m);
            }
        } catch (parseError) {
            console.error(`JSON parse error: ${parseError}`);
            client.reply(m.chat, 'Error processing server response.', m);
        }
    });
};

exports.run = {
    usage: ['generate'],
    category: 'generativeai',
    async: (m, { client }) => {
        generateImage(client, m);
    },
    error: false,
    limit: true,
    premium: true,
    verified: true,
    location: __filename
};
