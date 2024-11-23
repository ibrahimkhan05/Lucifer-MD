exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
        // Initialize session storage
        client.sessions = client.sessions || {};
        const sessionId = m.chat;

        // Days of the week list
        const daysOfWeek = [
            "Sunday",   // 0
            "Monday",   // 1
            "Tuesday",  // 2
            "Wednesday",// 3
            "Thursday", // 4
            "Friday",   // 5
            "Saturday"  // 6
        ];

        // Start session with /session activate
        if (text === 'session activate') {
            client.sessions[sessionId] = { active: true };
            await client.reply(m.chat, 'Session activated. Now you can send "/session 1" to get the corresponding day.', m);
            return;
        }

        // Check for /session <day_number> and ensure session is active
        if (text.startsWith('session ') && client.sessions[sessionId]?.active) {
            const dayNumber = parseInt(text.slice(8).trim(), 10); // Get the number after '/session'

            // Validate day number (between 0 and 6)
            if (!isNaN(dayNumber) && dayNumber >= 0 && dayNumber <= 6) {
                await client.reply(m.chat, `Today is ${daysOfWeek[dayNumber]}`, m);
            } else {
                await client.reply(m.chat, 'Invalid day number. Please enter a number between 0 and 6.', m);
            }
            return;
        }

        // If no session is active, notify the user
        if (!client.sessions[sessionId]?.active) {
            await client.reply(m.chat, 'No active session. Start one by sending "/session activate".', m);
        }
    },
    error: false
};
