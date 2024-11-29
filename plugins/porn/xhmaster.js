exports.run = {
    usage: ['xhmaster'],
    hidden: ['getxhmaster'],
    use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
    category: 'porn',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'step mom'), m);

            client.sendReact(m.chat, '🕒', m.key);

            // Fetch search results from XHamster API
            let json = await Func.fetchJson(`https://lust.scathach.id/xhamster/search?key=${text}`);
            if (!json.success) return client.reply(m.chat, global.status.fail, m);

            // Prepare results
            const data = json.data;
            if (data.length === 0) {
                return client.reply(m.chat, 'No results found.', m);
            }

            // Prepare carousel cards for all results
            const cards = data.map((v) => ({
                header: {
                    imageMessage: global.db.setting.cover, // Set the image for the card header
                    hasMediaAttachment: true,
                },
                body: {
                    text: `${v.title}`, // Video title
                },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "Watch Video", // Text displayed on the button
                            id: `${isPrefix}ytdl ${v.link}` // Video link for download or play
                        })
                    }]
                }
            }));

            const combinedCaption = "*X H M A S T E R   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video from the options below. Once you make a selection, the video link will be processed directly.";

            // Send the carousel with the video results
            await client.sendCarousel(m.chat, cards, m, {
                content: combinedCaption
            });

        } catch (e) {
            console.log(e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    premium: true
};
