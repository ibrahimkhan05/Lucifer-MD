// Initialize global sessions if they don't exist
if (!global.redTubeSessions) global.redTubeSessions = {};

// Function to handle the /redtube command (Search videos)
async function handleRedTubeRequest(m, { client, text, isPrefix }) {
    if (!text) {
        return client.reply(m.chat, 'Please provide a search query.', m);
    }

    client.sendReact(m.chat, '🕒', m.key);

    try {
        // Fetch search results from RedTube API
        const apiUrl = `https://lust.scathach.id/redtube/search?key=${text}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            return client.reply(m.chat, 'No results found.', m);
        }

        // Save search results to session
        global.redTubeSessions[m.chat] = { data: data.data };

        // Prepare the result in a selectable list format with URL included
        let resultMessage = "*🎬 R E D T U B E   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\n";
        const buttons = [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'Select a video',
                sections: [ {
                    rows: data.data.map((v, index) => ({
                        title: `${index + 1}. ${v.title}`,
                        id: `${isPrefix}ytdl${v.video}`  // Format URL for ytdl
                    }))
                }]
            })
        }];

        await client.sendIAMessage(m.chat, buttons, m, {
            content: "Here are the search results. Please select a video from the list:",
            footer: global.footer,
        });
    } catch (error) {
        console.error(`Error fetching RedTube search results: ${error.message}`);
        return client.reply(m.chat, 'Error fetching RedTube search results. Please try again later.', m);
    }
}

// Main exportable handler
exports.run = {
    usage: ['redtube'],
    hidden: ['getredtube'],
    use: 'query <search term>',
    category: 'porn',
    async: async (m, { client, text, isPrefix, command }) => {
        try {
            if (command === 'redtube') {
                await handleRedTubeRequest(m, { client, text, isPrefix });
            }
        } catch (error) {
            console.error(`Error in command execution: ${error.message}`);
        }
    }
};
