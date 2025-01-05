const { ytsearch } = require('ruhend-scraper'); // Import ytsearch from 'ruhend-scraper'

exports.run = {
    usage: ['yts'],
    hidden: ['ytsearch'],
    use: 'query',
    category: 'search',
    async: async (m, { client, text, Func, command, isPrefix }) => {
        try {
            // Check if a query is provided
            if (!text) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'kia bat ha'), m);
            }

            // Send a reaction to indicate processing
            client.sendReact(m.chat, '🕒', m.key);

            // Make a search request using the 'ruhend-scraper' API
            const { video } = await ytsearch(text); // Search for videos only

            // Check if video results are returned
            if (!video || video.length === 0) {
                return client.reply(m.chat, "No video results found.", m);
            }

            // Split the results into chunks of 18 and format the response
            const chunkSize = 18;
            for (let i = 0; i < video.length; i += chunkSize) {
                const chunk = video.slice(i, i + chunkSize);
                let combinedCaption = i === 0 ? '乂  *Y T  S E A R C H*\n\n' : ''; // Include caption only for the first chunk
                chunk.forEach((v, index) => {
                    combinedCaption += `    ◦  *Title* : ${v.title}\n`;
                    combinedCaption += `    ◦  *URL* : ${v.url}\n`;
                    combinedCaption += `    ◦  *Duration* : ${v.durationH}\n`;
                    combinedCaption += `    ◦  *Uploaded* : ${v.publishedTime}\n`;
                    combinedCaption += `    ◦  *Views* : ${v.view} views\n\n`;
                });
                // Send the formatted results as a single message
                await m.reply(combinedCaption);
            }

        } catch (e) {
            console.error(e); // Log the error for debugging
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
