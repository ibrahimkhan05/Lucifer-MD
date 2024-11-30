const fs = require('fs');
const { gpt } = require("gpti");

const userConversationsFile = 'user_conversations.json';

// Ensure user conversations file exists
if (!fs.existsSync(userConversationsFile)) {
    fs.writeFileSync(userConversationsFile, '{}', 'utf8');
    console.log('user_conversations.json created successfully.');
}

let userConversations = {};

// Load user conversations
try {
    userConversations = JSON.parse(fs.readFileSync(userConversationsFile, 'utf8'));
    console.log('User conversations loaded.');
} catch (err) {
    console.error('Error loading user conversations:', err);
}

// Clean up old conversations (24-hour retention)
function cleanupOldConversations() {
    const now = Date.now();
    for (const userId in userConversations) {
        userConversations[userId].conversations = userConversations[userId].conversations.filter(
            msg => now - new Date(msg.timestamp).getTime() < 24 * 60 * 60 * 1000
        );
        if (userConversations[userId].conversations.length === 0) {
            delete userConversations[userId];
        }
    }
    fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');
}

// Run cleanup hourly
setInterval(cleanupOldConversations, 60 * 60 * 1000);

exports.run = {
    async: async (m, { client }) => {
        try {
            const userId = `${m.sender}`;
            const user = global.db.users.find(v => v.jid === userId);

            // Ignore if the user is not premium
            if (!user || !user.premium) return;

            // Handle "/newchat" command
            if (m.text === '/newchat') {
                delete userConversations[userId];
                fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');
                client.reply(m.chat, 'Your chat history has been cleared. You can start a new conversation.', m);
                return;
            }

            // Initialize new conversation if not present
            if (!userConversations[userId]) {
                userConversations[userId] = { conversations: [] };
            }

            // Add user message to conversation history
            userConversations[userId].conversations.push({
                role: "user",
                content: m.text,
                timestamp: new Date()
            });

            // Call GPT API
            const history = userConversations[userId].conversations;
            const data = await gpt.v1({
                messages: history,
                prompt: m.text,
                model: "GPT-4",
                markdown: false
            });

            const response = data?.gpt || 'No response from GPT-4 API';

            // Reply to user and store response in history
            client.reply(m.chat, response, m);
            userConversations[userId].conversations.push({
                role: "assistant",
                content: response,
                timestamp: new Date()
            });

            // Save updated conversation
            fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');

        } catch (err) {
            console.error('Error:', err);
            client.reply(m.chat, 'An unexpected error occurred. Please try again later.', m);
        }
    },
    error: false,
    private: true
};
