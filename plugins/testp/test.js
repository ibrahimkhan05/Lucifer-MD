exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
        // Initialize session storage
        client.sessions = client.sessions || {};
        const sessionId = m.chat;

        if (text === 'session') {
            // Start a session for the user
            client.sessions[sessionId] = { active: true };
            await client.reply(m.chat, 'Session started. Send me any message, and I will echo it back to you. To end the session, send "/end".', m);
            return;
        }

        if (text === 'end') {
            // End the session for the user
            if (client.sessions[sessionId]?.active) {
                delete client.sessions[sessionId]; // Remove session data
                await client.reply(m.chat, 'Session ended. To start a new session, send "/session".', m);
            } else {
                await client.reply(m.chat, 'No active session to end. Start one by sending "/session".', m);
            }
            return;
        }

        // Check if a session is active for the user
        if (client.sessions[sessionId]?.active) {
            if (body) {
                // Echo the user's message back
                await client.reply(m.chat, `You said: "${body}"`, m);
            } else {
                // Handle cases where no body is present in the message
                await client.reply(m.chat, 'Please send a valid message to echo.', m);
            }
        } else {
            // Notify the user to start a session
            await client.reply(m.chat, 'No active session. Start one by sending "/session".', m);
        }
    },
    error: false
};
