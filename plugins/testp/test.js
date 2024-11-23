exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
        // Initialize session storage
        client.sessions = client.sessions || {};
        const sessionId = m.chat;

        // Check if the command is "/session"
        if (text === 'session') {
            // Create a new session for the user
            client.sessions[sessionId] = { active: true };
            await client.reply(m.chat, 'Session started. Send me any message, and I will echo it back to you.', m);
        } else {
            // Check if a session is active
            if (client.sessions[sessionId] && client.sessions[sessionId].active) {
                // Echo the user's message back
                await client.reply(m.chat, `You said: "${body}"`, m);
            } else {
                // No session is active
                await client.reply(m.chat, 'No active session. Start one by sending "/session".', m);
            }
        }
    },
    error: false
};
