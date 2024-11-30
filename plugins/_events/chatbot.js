const fs = require('fs');
const { gpt } = require("gpti");

const userConversationsFile = 'user_conversations.json';

// Ensure the user conversations file exists
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

// Function to clean up old conversations (older than 24 hours)
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

// Run cleanup every hour
setInterval(cleanupOldConversations, 60 * 60 * 1000);

// Main chatbot function
exports.run = {
    async: async (m, { client }) => {
        try {
            const userId = `${m.sender}`;
            const user = global.db.users.find(v => v.jid === userId);

            // Check if the user is a premium user
            if (!user || !user.premium) {
                client.reply(m.chat, 'This service is available only for premium users. Upgrade to access premium features.', m);
                return;
            }

            // Initialize a new chat if not already present
            if (!userConversations[userId]) {
                userConversations[userId] = { conversations: [] };
                client.reply(m.chat, 'Welcome Premium User! Start chatting. Use /newchat to reset the conversation.', m);
            }

            // Handle "/newchat" command to reset history
            if (m.text === '/newchat') {
                delete userConversations[userId];
                fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');
                client.reply(m.chat, 'Your chat history has been cleared. You can start a new conversation.', m);
                return;
            }

            // Add user message to conversation history
            userConversations[userId].conversations.push({
                role: "user",
                content: m.text,
                timestamp: new Date()
            });

            // Call GPT API to generate a response
            const history = userConversations[userId].conversations;
            try {
                const data = await gpt.v1({
                    messages: history,
                    prompt: m.text,
                    model: "GPT-4",
                    markdown: false
                });

                const response = data?.gpt || 'No response from GPT-4 API';

                // Reply to the user and store the assistant's response
                client.reply(m.chat, response, m);
                userConversations[userId].conversations.push({
                    role: "assistant",
                    content: response,
                    timestamp: new Date()
                });

                // Persist conversation history
                fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');
            } catch (apiError) {
                console.error('GPT-4 API error:', apiError);
                client.reply(m.chat, 'There was an error processing your request. Please try again later.', m);
            }

        } catch (err) {
            console.error('Error:', err);
            client.reply(m.chat, 'An unexpected error occurred. Please try again later.', m);
        }
    },
    error: false,
    private: true,
};
