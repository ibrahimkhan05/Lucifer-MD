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
            let failedJobs = 0;
            const totalJobs = Object.keys(models).length;

            // Notify the user that the generation process has started
            client.reply(m.chat, 'Please wait, generating images from all models...', m);

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
                        failedJobs++;
                        checkAllJobsCompleted();
                        return;
                    }

                    let postResponse;
                    try {
                        postResponse = JSON.parse(stdout);
                    } catch (parseError) {
                        console.error(`JSON parse error: ${parseError}`);
                        failedJobs++;
                        checkAllJobsCompleted();
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
                                    failedJobs++;
                                    checkAllJobsCompleted();
                                    return;
                                }

                                let statusResponse;
                                try {
                                    statusResponse = JSON.parse(stdout);
                                } catch (parseError) {
                                    console.error(`JSON parse error: ${parseError}`);
                                    failedJobs++;
                                    checkAllJobsCompleted();
                                    return;
                                }

                                const status = statusResponse.status;
                                if (status === 'succeeded') {
                                    const imageUrl = statusResponse.imageUrl;
                                    generatedImages.push({
                                        header: {
                                            imageMessage: imageUrl, // Use the result image URL here
                                            hasMediaAttachment: true
                                        },
                                        body: {
                                            text: `${modelKey} generated` // Optional: Custom text to display with the image
                                        },
                                        nativeFlowMessage: {
                                            buttons: [] // You can add buttons here if needed
                                        }
                                    });
                                    completedJobs++;
                                } else if (status === 'failed') {
                                    failedJobs++;
                                }

                                checkAllJobsCompleted();
                            });
                        } catch (e) {
                            failedJobs++;
                            checkAllJobsCompleted();
                        }
                    };

                    pollStatus();
                });
            };

            // Generate images for all models
            for (let modelKey in models) {
                handleModelGeneration(modelKey, text);
            }

            // Check if all jobs are completed and send carousel
            const checkAllJobsCompleted = () => {
                if (completedJobs + failedJobs === totalJobs) {
                    if (generatedImages.length > 0) {
                        // Send the carousel with only successful images
                        client.sendCarousel(m.chat, generatedImages, m, {
                            content: 'Here are the generated images from all models.'
                        });
                    } else {
                        client.reply(m.chat, 'All image generation attempts have failed. Please try again.', m);
                    }
                }
            };

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
