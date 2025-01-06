exports.run = {
    usage: ['bingimg'],
    use: 'query',
    category: 'generativeai',
    async: async (m, { client, text, Func }) => {
        if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'cute cats'), m);
        }

        m.reply('Fetching images, please wait...');

        const apiKey = `${global.betabotz}` ; // API Key
        const query = encodeURIComponent(text); // URL encode the query
        const apiUrl = `https://api.betabotz.eu.org/api/search/bing-img?text=${query}&apikey=${apiKey}`;

        try {
            // Fetch images
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data.status || !data.result || data.result.length === 0) {
                return client.reply(m.chat, 'No images found', m);
            }

            // Prepare carousel cards
            const cards = data.result.map((imageUrl, index) => ({
                header: {
                    imageMessage: imageUrl, // Image URL from API response
                    hasMediaAttachment: true,
                },
                body: {
                    text: `Image ${index + 1} of ${data.result.length}\nQuery: ${text}`,
                },
                nativeFlowMessage: {
                    // Add custom fields if needed
                }
            }));

            // Send carousel of images
            await client.sendCarousel(m.chat, cards, m, {
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
