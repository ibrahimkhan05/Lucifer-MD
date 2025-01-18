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

            // Log the fetched data
            console.log('Fetched images data:', data);

            // Prepare cards for the carousel
            const cards = data.result.map((imageUrl, index) => ({
                header: {
                    imageMessage: imageUrl,
                    hasMediaAttachment: true,
                },
                body: {
                    text: `◦  *Prompt* : ${text}\nImage ${index + 1} of ${data.result.length}`,
                },
                nativeFlowMessage: {
                    buttons: [{
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Community',
                            url: global.db.setting.link,
                            webview_presentation: null
                        })
                    }]
                }
            }));

            // Send carousel with the prepared cards
            client.sendCarousel(m.chat, cards, m, {
                content: 'Here are your images:',
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
