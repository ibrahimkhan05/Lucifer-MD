// Initialize global sessions if they don't exist
if (!global.xhMasterSessions) global.xhMasterSessions = {};

// Function to handle the /xhmaster command (Search videos)
async function handleXhMasterRequest(m, { client, text, isPrefix }) {
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
        global.xhMasterSessions[m.chat] = { data: data.data };

        // Prepare the result in a selectable list format with URL and `id: ytdl`
        let resultMessage = "*🎬 X H A M S T E R   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\n";
        const buttons = [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'Select a video',
                sections: [ {
                    rows: data.data.map((v, index) => ({
                        title: `${index + 1}. ${v.title}`,
                        id: `${isPrefix}ytdl ${v.link}`,  // Prefix for executing the command
                    }))
                }]
            })
        }];

        await client.sendIAMessage(m.chat, buttons, m, {
            content: "Here are the search results. Please select a video from the list:",
            footer: global.footer,
        });
    } catch (error) {
        console.error(`Error fetching XHamster search results: ${error.message}`);
        return client.reply(m.chat, 'Error fetching XHamster search results. Please try again later.', m);
    }
}

// Main exportable handler
exports.run = {
    usage: ['xhmaster'],
    use: 'query',
    category: 'porn',
    async: async (m, { client, text, isPrefix, command }) => {
        try {
            if (command === 'xhmaster') {
                await handleXhMasterRequest(m, { client, text, isPrefix });
            }
        } catch (error) {
            console.error(`Error in command execution: ${error.message}`);
        }
    }
};
