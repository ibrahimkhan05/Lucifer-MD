
// Initialize global sessions if they don't exist
if (!global.youPornSessions) global.youPornSessions = {};

// Function to handle the /xhmaster command (Search videos)
async function youPornrequest(m, { client, text, isPrefix }) {
    if (!text) {
        return client.reply(m.chat, 'Please provide a search query.', m);
    }

    client.sendReact(m.chat, '🕒', m.key);

    try {
        // Fetch search results from XHamster API
        const apiUrl = `https://lust.scathach.id/xhamster/search?key=${text}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            return client.reply(m.chat, 'No results found.', m);
        }

        // Save search results to session
        global.youPornSessions[m.chat] = { data: data.data };

        // Prepare the result in a selectable list format with URL and `id: ytdl`
        let resultMessage = "*🎬 Y O U P O R N   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\n";
        const buttons = [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'Select a video',
                sections: [ {
                    rows: data.data.map((v, index) => ({
                        title: `${index + 1}. ${v.title}`,
                        id: `${isPrefix}ytdl ${v.video}`,  // Prefix for executing the command
                    }))
                }]
            })
        }];

        await client.sendIAMessage(m.chat, buttons, m, {
            content: "Here are the search results. Please select a video from the list:",
            footer: global.footer,
        });
    } catch (error) {
        console.error(`Error fetching youporn search results: ${error.message}`);
        return client.reply(m.chat, 'Error fetching youporn search results. Please try again later.', m);
    }
}

// Main exportable handler
exports.run = {
    usage: ['youporn'],
    use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
    category: 'porn',
    async: async (m, { client, text, isPrefix, command }) => {
        try {
            if (command === 'youporn') {
                await youPornrequest(m, { client, text, isPrefix });
            }
        } catch (error) {
            console.error(`Error in command execution: ${error.message}`);
        }
    }
};
