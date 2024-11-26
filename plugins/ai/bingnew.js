const fs = require('fs');

// Define the shared file for storing all user histories
const historyFile = 'bing_history.json';

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

exports.run = {
  usage: ['bingnew'],
  use: 'newchat',
  category: 'ai',
  async: async (m, { client, isPrefix, command, Func }) => {
    try {
      const userId = `${m.sender}`;

      // Check if the user exists in the history file
      if (userHistories[userId]) {
        // Remove the user's history
        delete userHistories[userId];

        // Save the updated histories
        saveHistories();

        // Reply to the user confirming the history has been cleared
        client.reply(m.chat, 'Your conversation history has been cleared. Feel free to start a new chat!', m);
      } else {
        // If no history exists for the user, inform them
        client.reply(m.chat, 'You don\'t have any conversation history to clear.', m);
      }
    } catch (e) {
      console.error('Error in /bingnew command:', e);
      client.reply(m.chat, global.status.error || 'An error occurred while clearing the history.', m);
    }
  },
  error: false,
  limit: true,
  verified: false,
  premium: false,
};
