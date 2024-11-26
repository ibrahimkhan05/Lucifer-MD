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

// Function to select random models and start image generation
const startImageGeneration = async (client, m) => {
    // Pick 4 random models
    const randomModels = [];
    while (randomModels.length < 4) {
        const randomModel = models[Math.floor(Math.random() * models.length)];
        if (!randomModels.includes(randomModel)) randomModels.push(randomModel);
    }

    const imageUrls = [];
    let jobsCompleted = 0;
    const jobIds = [];

    client.reply(m.chat, 'Please wait while images are being generated...', m);

    // Generate images for the 4 selected models
    randomModels.forEach((model) => {
        const promptText = "A beautiful scene generated with the model: " + model;

        // Construct curl command for each model generation
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

            // Log the raw response to debug
            console.log("Raw response: ", stdout);

            try {
                const postResponse = JSON.parse(stdout);
                if (postResponse && postResponse.job) {
                    jobIds.push(postResponse.job); // Store job ID for polling
                }
            } catch (parseError) {
                console.error(`Error parsing response: ${parseError}`);
            }

            jobsCompleted++;

            // If all jobs are submitted, start polling the jobs
            if (jobsCompleted === 4) {
                pollJobs(jobIds, imageUrls, client, m);
            }
        });
    });
};

// Polling function to check job status
const pollJobs = (jobIds, imageUrls, client, m) => {
    let pollInterval = setInterval(() => {
        jobIds.forEach((jobId, index) => {
            const statusCheckCommand = `curl --request GET \
                --url https://api.prodia.com/v1/sdxl/status/${jobId} \
                --header 'X-Prodia-Key: 501eba46-a956-4649-96aa-2d9cc0f048bf' \
                --header 'accept: application/json'`;

            exec(statusCheckCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }

                try {
                    const statusResponse = JSON.parse(stdout);
                    if (statusResponse.status === "completed" && statusResponse.data && statusResponse.data.url) {
                        imageUrls.push(statusResponse.data.url); // Store the image URL
                    }
                } catch (parseError) {
                    console.error(`Error parsing status response: ${parseError}`);
                }

                // If all jobs are completed, stop polling and send the images
                if (imageUrls.length === jobIds.length) {
                    clearInterval(pollInterval);
                    sendImages(imageUrls, client, m);
                }
            });
        });
    }, 5000); // Poll every 5 seconds
};

// Function to send the images once all jobs are completed
const sendImages = (imageUrls, client, m) => {
    setTimeout(() => {
        if (imageUrls.length > 0) {
            const cards = imageUrls.map(url => ({
                header: {
                    imageMessage: url,  // Use the generated image URL
                    hasMediaAttachment: true,
                },
                body: {
                    text: "Generated Image",
                },
                nativeFlowMessage: {
                    buttons: []  // Add buttons if necessary
                }
            }));

            // Send carousel with the images
            client.sendCarousel(m.chat, cards, m, { content: 'Here are your generated images:' });
        } else {
            client.reply(m.chat, 'Sorry, no images were generated.', m);
        }
    }, 8000); // Add a delay before sending images
};

exports.run = {
    usage: ['generate'],
    category: 'generativeai',
    async: (m, { client }) => {
         startImageGeneration(client, m);
    },
    error: false,
    limit: true,
    premium: true,
    verified: true,
    location: __filename
};
