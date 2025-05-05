exports.run = {
   usage: ['deepseek'],
   use: 'prompt',
   category: 'ai',
   async: async (m, { client, text, isPrefix, command, Func }) => {
      try {
         // Ensure a prompt is provided either as quoted text or input
         if (!m.quoted && !text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'what is JavaScript?'), m);
         }

         // Display a loading reaction
         client.sendReact(m.chat, '🕒', m.key);

         
        const json = await Func.fetchJson(`https://bk9.fun/ai/deepseek-r1?q=${text}`);

         // Check the API response
         if (json.status != true) return client.reply(m.chat, global.status.fail, m);
         client.reply(m.chat, json.BK9.content, m);
         
      } catch (e) {
         // Handle and log errors
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename,
};
