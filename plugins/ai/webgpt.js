const { gpt } = require("gpti");

exports.run = {
   usage: ['webgpt'],
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

         // Prepare the prompt
         const prompt = m.quoted?.text || text;

         // Call the GPT API
         const data = await gpt.web({
            prompt,
            markdown: false,
         });

         // Check the API response
         if (data?.gpt) {
            m.reply(data.gpt);
         } else {
            client.reply(m.chat, 'No response from the GPT API.', m);
         }

         // Log the response for debugging
         console.log({
            status: data?.status || 'unknown',
            response: data?.gpt || 'No response',
         });
      } catch (e) {
         // Handle and log errors
         console.error('Error in webgpt command:', e);
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename,
};
