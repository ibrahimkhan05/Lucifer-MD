exports.run = {
   usage: ['igs'],
   hidden: ['igstory'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.instagram.com/p/CK0tLXyAzEI'), m);
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

         const processedUrls = new Set();
         for (const item of response.message) {
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
