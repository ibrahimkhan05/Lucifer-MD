const axios = require('axios');
const querystring = require('querystring');

exports.run = {
   usage: ['ig'],
   hidden: ['igdl'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.instagram.com/reel/DF9rbvbyPq7/?igsh=MTN2aGZ0M3ZycDhzZA=='), m);
         }
         if (!args[0].match(/(https:\/\/www.instagram.com)/gi)) {
            return client.reply(m.chat, global.status.invalid, m);
         }

         client.sendReact(m.chat, '🕒', m.key);
         const startTime = Date.now();

         // Encode URL properly
         const encodedUrl = encodeURIComponent(args[0]);

         // Add headers like a browser request
         const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
         };

         const apiUrl = `https://api.betabotz.eu.org/api/download/igdowloader?url=${encodedUrl}&apikey=${global.betabotz}`;
         
         const response = await axios.get(apiUrl, { headers });

         if (!response.data.status || !response.data.message.length) {
            return client.reply(m.chat, 'Unable to fetch the content. Please try again.', m);
         }

         const processedUrls = new Set();
         for (const item of response.data.message) {
            if (processedUrls.has(item._url)) continue;

            processedUrls.add(item._url);
            const file = await Func.getFile(item._url);
            const filename = `file_${Date.now()}.${file.extension}`;
            const message = `🍟 *Fetching* : ${Date.now() - startTime} ms`;

            if (['jpg', 'jpeg', 'png', 'webp'].includes(file.extension)) {
               await client.sendFile(m.chat, item._url, filename, message, m);
            } else {
               await client.sendFile(m.chat, item._url, 'video.mp4', message, m);
            }

            await Func.delay(1500);
         }
      } catch (error) {
         console.error('Error:', error);
         client.reply(m.chat, 'An error occurred while processing your request.', m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
};
