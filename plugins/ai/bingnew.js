const fs = require('fs');

exports.run = {
  usage: ['bingnew'],
  use: 'clear',
  category: 'ai',
  async: async (m, { client, text, args, isPrefix, command, Func }) => {
    try {
      // Get the user ID
      const userId = `${m.sender}`; 

      // Load the conversation history from the file
      const historyFile = 'bing_history.json';
      let userHistories = JSON.parse(fs.readFileSync(historyFile, 'utf8'));

      // Check if the user has history in the file
      if (!userHistories[userId] || userHistories[userId].length === 0) {
        return client.reply(m.chat, "You don't have any conversation history to clear.", m);
      }

      // Remove the user's history
      delete userHistories[userId];

      // Save the updated history back to the file
      fs.writeFileSync(historyFile, JSON.stringify(userHistories, null, 2), 'utf8');

      // Respond to the user
      client.reply(m.chat, "Your conversation history has been cleared.", m);

    } catch (e) {
      return client.reply(m.chat, global.status.error, m);
    }
  },
  error: false,
  limit: true,
  verified: false,
  premium: false,
};
