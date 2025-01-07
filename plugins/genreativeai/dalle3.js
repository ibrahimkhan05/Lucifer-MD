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
            // Fetch images using Func.fetchJson
            const data = await Func.fetchJson(apiUrl);

            // Validate the response structure
            if (!data.status || !data.result || data.result.length === 0) {
                return client.reply(m.chat, 'No images found', m);
            }

            // Prepare carousel cards for the images
            const cards = await Promise.all(data.result.map(async (imageUrl, index) => {
                try {
                    // Fetch the image buffer from the URL using Func.fetchBuffer
                    const imageBuffer = await Func.fetchBuffer(imageUrl);

                    return {
                        header: {
                            imageMessage: imageBuffer, // Image as buffer
                            hasMediaAttachment: true,
                        },
                        body: {
                            text: `Image ${index + 1} of ${data.result.length}\nQuery: ${text}`,
                        },
                        nativeFlowMessage: {}
                    };
                } catch (err) {
                    console.error(`Failed to fetch image ${index + 1}:`, err);
                    return null; // Skip this image if fetch fails
                }
            }));

            // Filter out any null results (failed fetches)
            const validCards = cards.filter(card => card !== null);

            if (validCards.length === 0) {
                return client.reply(m.chat, 'No valid images to send.', m);
            }

            // Send carousel of images
            await client.sendCarousel(m.chat, validCards, m, {
                content: 'Here are the images generated based on your query:',
            });

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
