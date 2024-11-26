exports.runNewChat = {
    usage: ['bingnew'],
    use: 'clear',
    category: 'ai',
    async: async (m, { client, isPrefix, command }) => {
      try {
        const userId = `${m.sender}`;
  
        // Check if the user has any conversation history
        if (userHistories[userId] && userHistories[userId].conversations && userHistories[userId].conversations.length > 0) {
          // Clear the user's conversation history
          clearUserHistory(userId);
  
          // Send a confirmation message to the user
          client.reply(m.chat, 'Your conversation history has been cleared.', m);
        } else {
          // Notify the user that there is no history to clear
          client.reply(m.chat, 'No conversation history found to clear.', m);
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