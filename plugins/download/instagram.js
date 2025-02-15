exports.run = {
   usage: ['ig'],
   hidden: ['igdl'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.instagram.com/reel/CK0tLXyAzEI'), m);
         }
         if (!args[0].match(/(https:\/\/www.instagram.com)/gi)) {
            return client.reply(m.chat, global.status.invalid, m);
         }

         client.sendReact(m.chat, '🕒', m.key);
         const startTime = Date.now();
         const apiUrl = `https://api.betabotz.eu.org/api/download/igdowloader?url=${args[0]}&apikey=${global.betabotz}`;

         const response = await Func.fetchJson(apiUrl);
         if (!response.status || !response.message.length) {
            return client.reply(m.chat, 'Unable to fetch the content. Please try again.', m);
         }

         const mediaUrls = response.message.map(item => item._url);
         if (mediaUrls.length === 1) {
            // If only one media file (image or video), send it directly
            const file = await Func.getFile(mediaUrls[0]);
            const filename = `file_${Date.now()}.${file.extension}`;
            const message = `🍟 *Fetched in* : ${Date.now() - startTime} ms`;

            await client.sendFile(m.chat, mediaUrls[0], filename, message, m);
         } else {
            // If multiple images/videos, send them all
            for (const item of response.message) {
               const file = await Func.getFile(item._url);
               const filename = `file_${Date.now()}.${file.extension}`;
               const message = `🍟 *Fetched in* : ${Date.now() - startTime} ms`;

               if (file.extension === 'mp4') {
                  // Send video normally
                  await client.sendFile(m.chat, item._url, 'video.mp4', message, m);
               } else {
                  // Send image
                  await client.sendFile(m.chat, item._url, filename, message, m);
               }

               await Func.delay(1500);
            }
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
