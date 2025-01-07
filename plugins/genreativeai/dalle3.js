exports.run = {
    usage: ['bingimg'],
    use: 'query',
    category: 'generativeai',
    async: async (m, { client, text, Func }) => {
        if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'cute cats'), m);
        }

        m.reply('Fetching images, please wait...');

        const apiKey = `${global.betabotz}`; // API Key
        const query = encodeURIComponent(text); // URL encode the query
        const apiUrl = `https://api.betabotz.eu.org/api/search/bing-img?text=${query}&apikey=${apiKey}`;

        try {
            // Fetch images using Func.fetchJson from the API URL
            const data = await Func.fetchJson(apiUrl);

            // Check if the API response contains valid data
            if (!data.status || !data.result || data.result.length === 0) {
                return client.reply(m.chat, 'No images found', m);
            }

            // Send each image one by one with a delay
            for (let index = 0; index < data.result.length; index++) {
                const imageUrl = data.result[index];
                try {
                    // Fetch the image buffer from each image URL
                    const imageBuffer = await Func.fetchBuffer(imageUrl);

                    // Send the image with the formatted message
                    const caption = `◦  *Prompt* : ${text}\nImage ${index + 1} of ${data.result.length}`;
                    await client.sendFile(m.chat, imageBuffer, '', caption, m);

                    // Add a half-second (500ms) delay between each image
                    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms = 0.5 seconds

                } catch (err) {
                    // If an error occurs while fetching the image, log the error and continue with the next image
                    console.error(`Failed to fetch image ${index + 1}:`, err);
                }
            }

        } catch (error) {
            console.error('Error fetching images:', error);
            m.reply('An error occurred while fetching images. Please try again later.');
        }
    },
    error: false,
    limit: true,
    premium: false,
    verified: true
};
