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
                return client.reply(m.chat, `Please provide a prompt. Example: /${command} "your prompt here"`, m);
            }

            let generatedImages = [];
            let completedJobs = 0;
            const totalJobs = Object.keys(models).length;

            const handleModelGeneration = async (modelKey, promptText) => {
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
                        return;
                    }

                    let postResponse;
                    try {
                        postResponse = JSON.parse(stdout);
                    } catch (parseError) {
                        console.error(`JSON parse error: ${parseError}`);
                        return;
                    }

                    const jobId = postResponse.job;

                    const pollStatus = async () => {
                        try {
                            const curlStatusCommand = `curl --request GET \
                                --url https://api.prodia.com/v1/job/${jobId} \
                                --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
                                --header 'accept: application/json'`;

                            exec(curlStatusCommand, (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`exec error: ${error}`);
                                    return;
                                }

                                let statusResponse;
                                try {
                                    statusResponse = JSON.parse(stdout);
                                } catch (parseError) {
                                    console.error(`JSON parse error: ${parseError}`);
                                    return;
                                }

                                const status = statusResponse.status;
                                if (status === 'succeeded') {
                                    const imageUrl = statusResponse.imageUrl;
                                    generatedImages.push({
                                        header: {
                                            imageMessage: global.db.setting.cover,
                                            hasMediaAttachment: true
                                        },
                                        body: {
                                            text: `${modelKey} generated`
                                        },
                                        nativeFlowMessage: {
                                            buttons: []
                                        }
                                    });
                                    completedJobs++;

                                    // Once all jobs are completed, send the carousel
                                    if (completedJobs === totalJobs) {
                                        client.sendCarousel(m.chat, generatedImages, m, {
                                            content: 'Here are the generated images from all models.'
                                        });
                                    }
                                } else if (status === 'failed') {
                                    completedJobs++;

                                    // Check if all jobs are completed and send carousel
                                    if (completedJobs === totalJobs) {
                                        client.reply(m.chat, 'Some image generations failed. Please try again.', m);
                                    }
                                } else {
                                    setTimeout(pollStatus, 9000);
                                }
                            });
                        } catch (e) {
                            client.reply(m.chat, 'Error fetching job status.', m);
                        }
                    };

                    pollStatus();
                });
            };

            // Generate images for all models
            for (let modelKey in models) {
                handleModelGeneration(modelKey, text);
            }

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
