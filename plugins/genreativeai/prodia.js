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

const Scraper = {
    text2img: async (text, eff, upscale, sampler, ratio, XprodiaKey) => {
        return new Promise(async (resolve) => {
            try {
                const options = {
                    method: 'POST',
                    url: 'https://api.prodia.com/v1/sd/generate',
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                        'X-Prodia-Key': XprodiaKey
                    },
                    data: {
                        model: eff,
                        prompt: text,
                        negative_prompt: 'canvas frame, cartoon, 3d, ((disfigured)), ((bad art)), ((deformed)),((extra limbs)),((close up)),((b&w)), weird colors, blurry, (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck))), Photoshop, video game, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra legs, extra arms, disfigured, deformed, cross-eye, body out of frame, blurry, bad art, bad anatomy, 3d render',
                        steps: 25,
                        cfg_scale: 7,
                        seed: -1,
                        upscale: upscale,
                        sampler: sampler,
                        aspect_ratio: ratio
                    }
                };

                axios
                    .request(options)
                    .then(function (response) {
                        console.log(response.data);
                        resolve({
                            status: true,
                            model: eff,
                            steps: 25,
                            cfg_scale: 7,
                            seed: -1,
                            upscale: upscale,
                            sampler: sampler,
                            aspect_ratio: ratio,
                            msg: `https://images.prodia.xyz/${response.data.job}.png` // Image URL from Prodia
                        });
                    })
                    .catch(function (error) {
                        console.error(error);
                        resolve({
                            status: false
                        });
                    });

            } catch (e) {
                console.log(e);
                return resolve({
                    status: false
                });
            }
        });
    }
};

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

            const imagePromises = selectedModels.map(async (model) => {
                const eff = model; // Model is passed as 'eff'
                const upscale = true; // Assuming upscale is true
                const sampler = "DPM++ 2M Karras"; // Use default sampler
                const ratio = "16:9"; // Aspect ratio can be set as per requirement
                const XprodiaKey = "501eba46-a956-4649-96aa-2d9cc0f048bf"; // Prodia API Key

                try {
                    const imgData = await Scraper.text2img(text, eff, upscale, sampler, ratio, XprodiaKey);

                    if (imgData.status) {
                        return {
                            image: imgData.msg, // The URL to the generated image
                            text: `*Prompt*: ${text} - Model: ${eff}`
                        };
                    } else {
                        console.error(`Error generating image for model: ${eff}`);
                        return { error: true };
                    }
                } catch (e) {
                    console.error(`Error generating image for model: ${eff}`, e);
                    return { error: true };
                }
            });

            // Wait for all image generation promises to complete
            const images = await Promise.all(imagePromises);

            // Filter out any errors and ensure valid data
            const validImages = images.filter(img => img && !img.error);

            if (validImages.length > 0) {
                // Send the valid images as a carousel
                const carousel = validImages.map((img) => ({
                    header: { imageMessage: { url: img.image }, hasMediaAttachment: true }, // Here we set the image URL
                    body: { text: img.text },
                    nativeFlowMessage: { buttons: [] }, // Remove buttons as requested
                    image: img.image
                }));

                console.log('Sending carousel of generated images');
                client.sendCarousel(m.chat, carousel, m, { content: 'Here are the generated images!' });
            } else {
                console.log('Error: No valid images were generated');
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
