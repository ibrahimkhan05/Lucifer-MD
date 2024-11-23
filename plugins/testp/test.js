exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
        if (text.startsWith('session')) {
            const inputText = text.slice(8).trim(); // Extract text after '/session'

            if (inputText) {
                // Reply with the input text
                await client.reply(m.chat, `You said: "${inputText}"`, m);
            } else {
                // If no text after '/session', ask for valid input
                await client.reply(m.chat, 'Please send some text after "/session" to echo.', m);
            }
            return;
        }

        // Default behavior for non-/session messages
        if (body) {
            await client.reply(m.chat, `You said: "${body}"`, m);
        }
    },
    error: false
};
