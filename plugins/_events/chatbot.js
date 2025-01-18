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
    async: async (m, { client, isPrefix, command, Func }) => {
        try {
            const userId = `${m.chat}`;
            const user = global.db.users.find(v => v.jid === userId);

            // Ignore if the user is not premium
            if (!user || !user.premium) return; // Don't reply if the user is not premium

            // Check if chatbot is enabled
            const setting = global.db.setting;
            if (!m.fromMe && !setting.chatbot) return; // Ignore messages if chatbot is disabled

            if (['conversation', 'extendedTextMessage'].includes(m.mtype)) {
                // Handle "/newchat" command to reset history
                if (m.text === '/newchat') {
                    delete userConversations[userId];
                    fs.writeFileSync(userConversationsFile, JSON.stringify(userConversations), 'utf8');
                    client.reply(m.chat, 'Your chat history has been cleared. You can start a new chat.', m);
                    return;
                }

                // Initialize user conversation if new
                if (!userConversations[userId]) {
                    userConversations[userId] = { conversations: [], messageCount: 0, newChat: false };
                    client.reply(m.chat, 'Welcome! Start chatting. Use /newchat to clear your history.', m);
                }

                // Add user's message to conversation history
                userConversations[userId].conversations.push({
                    role: "user",
                    content: m.text,
                    timestamp: new Date()
                });

                // Call GPT API
                const history = userConversations[userId].conversations;

                try {
                    const data = await gpt.v1({
                        messages: history,
                        prompt: m.text,
                        model: "GPT-4",
                        markdown: false
                    });

                    const response = data?.gpt || 'No response from GPT-4 API';

                    // Reply to user and store assistant response
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
            }
        } catch (err) {
            console.error('Error:', err);
            client.reply(m.chat, 'There was an error processing your request. Please try again later.', m);
        }
    },
    error: false,
    private: true,
    cache: true,
    premium: true,
    location: __filename
};
