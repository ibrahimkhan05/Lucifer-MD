exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
        // Initialize session storage
        client.sessions = client.sessions || {};
        const sessionId = m.chat;

        // Handle /session command
        if (text === 'session') {
            // Start a session for the user
            client.sessions[sessionId] = { active: true };
            await client.reply(m.chat, 'Session started. Send any message, and I will echo it back to you.', m);
            return;
        }

        // Handle /session with additional text
        if (text.startsWith('session ') && client.sessions[sessionId]?.active) {
            const inputText = text.slice(8).trim(); // Extract text after '/session'

            if (inputText) {
                // Echo the user's input text if session is active
                await client.reply(m.chat, `You said: "${inputText}"`, m);
            }
            return;
        }

        // If no session is active, notify the user to start one
        if (!client.sessions[sessionId]?.active) {
            await client.reply(m.chat, 'No active session. Start one by sending "/session".', m);
        }
    },
    error: false
};
