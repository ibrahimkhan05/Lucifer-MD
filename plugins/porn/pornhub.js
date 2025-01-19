const { PornHub } = require('pornhub.js'); // Import the PornHub class
const pornhub = new PornHub(); // Create an instance of the PornHub class

// Initialize global sessions if they don't exist
if (!global.pornHubSessions) global.pornHubSessions = {};

// Function to handle the /pornhub command (Search videos)
async function handlePornHubRequest(m, { client, text, isPrefix }) {
    if (!text) {
        return client.reply(m.chat, 'Please provide a search query.', m);
    }

    client.sendReact(m.chat, '🕒', m.key);

    try {
        // Fetch search results from PornHub API
        const result = await pornhub.searchVideo(text);

        if (!result.data || result.data.length === 0) {
            return client.reply(m.chat, 'No results found.', m);
        }

        // Save search results to session
        global.pornHubSessions[m.chat] = { data: result.data };

        // Prepare the result in a selectable list format with URL included
        let resultMessage = "*🎬 P O R N H U B   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\n";
        const buttons = [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'Select a video',
                sections: [{
                    rows: result.data.map((v, index) => ({
                        title: `${index + 1}. ${v.title}`,
                        id: `${isPrefix}ytdl ${v.url}`  // URL passed to /ytdl
                    }))
                }]
            })
        }];

        await client.sendIAMessage(m.chat, buttons, m, {
            content: "Here are the search results. Please select a video from the list:",
        });
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        client.reply(m.chat, '❌ An error occurred while fetching data.', m);
    }
}

// Main exportable handler
exports.run = {
    usage: ['pornhub'],
    hidden: ['getpornhub'],
    use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
    category: 'porn',
    async: async (m, { client, text, isPrefix, command }) => {
        try {
            if (command === 'pornhub') {
                await handlePornHubRequest(m, { client, text, isPrefix });
            }
        } catch (error) {
            console.error(`Error in command execution: ${error.message}`);
        }
    }
};
