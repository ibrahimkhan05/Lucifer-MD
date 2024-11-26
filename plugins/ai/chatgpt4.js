const { gpt } = require("gpti");

exports.run = {
   usage: ['chatgpt'],
   use: 'prompt',
   category: 'ai',
   async: async (m, { client, text, isPrefix, command, Func }) => {
      try {
         // Ensure the user provides a prompt or uses quoted text
         if (!m.quoted && !text) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'what is JavaScript?'), m);
         }

         // Display a loading reaction
         client.sendReact(m.chat, '🕒', m.key);

         // Prepare the conversation history
         const history = m.quoted?.text
            ? [{ role: "user", content: m.quoted.text }]
            : [{ role: "user", content: text }];

         // Call the GPT-4 API
         const data = await gpt.v1({
            messages: history,
            prompt: text || m.quoted.text,
            model: "GPT-4",
            markdown: false,
         });

         // Check the response and reply
         if (data?.gpt) {
            m.reply(data.gpt);
         } else {
            client.reply(m.chat, 'No response from GPT-4 API.', m);
         }

         // Log the API response for debugging
         console.log({
            status: data?.status || 'unknown',
            response: data?.gpt || 'No response',
            details: data?.details || 'No details',
         });
      } catch (e) {
         // Handle errors and provide feedback
         console.error('Error in chatgpt4 command:', e);
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename,
};
