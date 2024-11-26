const fs = require('fs');
const { bing } = require("gpti");

// Define the shared file for storing all user histories
const historyFile = 'bing_usage.json';

// Ensure the history file exists
if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, '{}', 'utf8');
}

// Load the existing histories from the file
let userHistories = JSON.parse(fs.readFileSync(historyFile, 'utf8'));

// Save updated histories to the file
function saveHistories() {
    fs.writeFileSync(historyFile, JSON.stringify(userHistories, null, 2), 'utf8');
}

// Function to clear user history
function clearUserHistory(userId) {
    if (userHistories[userId]) {
        delete userHistories[userId];
        saveHistories();
    }
}

exports.run = {
  usage: ['bing'],
  use: 'query',
  category: 'ai',
  async: async (m, { client, text, isPrefix, command, Func }) => {
    try {
      if (!text) {
        return client.reply(m.chat, Func.example(isPrefix, command, 'What is AI?'), m);
      }

      client.sendReact(m.chat, '🕒', m.key);

      const userId = `${m.sender}`;
      // Initialize history for the user if it doesn't exist
      if (!userHistories[userId]) {
        userHistories[userId] = { conversations: [] };
      }

      // Add the user's query to the history
      userHistories[userId].conversations.push({
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      });

      // Call the Bing API with the user's conversation history
      const data = await bing({
        messages: userHistories[userId].conversations.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        conversation_style: 'Balanced',
        markdown: false,
        stream: false,
      });

      if (data?.message) {
        // Add the assistant's response to the history
        userHistories[userId].conversations.push({
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        });

        // Save updated history
        saveHistories();

        // Reply to the user
        client.reply(m.chat, data.message, m);
      } else {
        client.reply(m.chat, 'No response received from Bing API.', m);
      }
    } catch (e) {
      console.error('Error in /bing command:', e);
      client.reply(m.chat, global.status.error || 'An error occurred.', m);
    }
  },
  error: false,
  limit: true,
  verified: false,
  premium: false,
};