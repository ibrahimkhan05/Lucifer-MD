const fs = require('fs');
const axios = require('axios');
const decode = require('html-entities').decode;

exports.run = {
   usage: ['get'],
   category: 'owner',
   async: async (m, {
      client,
      command,
      args,
      env,
      Func
   }) => {
      try {
         if (/get|fetch/i.test(command)) {
            // Check if the user provided the URL
            if (!args || !args[0]) {
                return client.reply(m.chat, Func.example("/get your link"), m);
            }

            // Send a loading reaction while fetching the URL
            client.sendReact(m.chat, '🕒', m.key);

            // Fetch the data from the provided URL
            const fetch = await axios.get(args[0], {
               headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Referer": "https://www.google.com/",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
               }
            });

            // Check the content type and respond accordingly
            if (/json/i.test(fetch.headers['content-type'])) {
                return m.reply(Func.jsonFormat(fetch.data));  // Send the JSON data formatted
            }

            if (/text/i.test(fetch.headers['content-type'])) {
                return m.reply(fetch.data);  // Send the text data
            }

            // If it's neither JSON nor text, send the file from the URL
            return client.sendFile(m.chat, args[0], '', '', m);
         }
      } catch (e) {
         // Log the error and send an error message to the user
         console.log(e);
         return client.reply(m.chat, `An error occurred: ${e.message}`, m);
      }
   },
   owner: true,
   cache: true,
   location: __filename
};
