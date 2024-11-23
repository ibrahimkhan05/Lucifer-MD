exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
        // Initialize session storage
        client.sessions = client.sessions || {};
        const sessionId = m.chat;

        // Check for the "/session" command
        if (text === 'session') {
            client.sessions[sessionId] = { active: true };
            await client.reply(m.chat, 'Session started. Send me any message, and I will echo it back to you. To end the session, send "/end".', m);
            return;
        }

        // Check for the "/end" command
        if (text === 'end') {
            if (client.sessions[sessionId]?.active) {
                delete client.sessions[sessionId];
                await client.reply(m.chat, 'Session ended. To start a new session, send "/session".', m);
            } else {
                await client.reply(m.chat, 'No active session to end. Start one by sending "/session".', m);
            }
            return;
        }

        // Additional conditions (similar to anti-virtex logic)
        if (!m.fromMe && body && body.length > 1000) {
            await client.reply(m.chat, 'Your message is too long. Please keep it concise.', m);
            return;
        }

        // Check if a session is active
        if (client.sessions[sessionId]?.active) {
            await client.reply(m.chat, `You said: "${body}"`, m);
        } else {
            await client.reply(m.chat, 'No active session. Start one by sending "/session".', m);
        }
    },
    error: false
};
