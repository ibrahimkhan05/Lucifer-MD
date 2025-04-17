exports.run = {
   usage: ['ig'],
   hidden: ['igdl'],
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
         const apiUrl = `https://bk9.fun/download/instagram?url=${encodeURIComponent(args[0])}`;
         
         const response = await Func.fetchJson(apiUrl);
         if (!response.status || !response.BK9 || !response.BK9.length) {
            return client.reply(m.chat, 'Unable to fetch the content. Please try again.', m);
         }

         const processedUrls = new Set();
         for (const item of response.BK9) {
            if (processedUrls.has(item.url)) continue;

            processedUrls.add(item.url);
            const file = await Func.getFile(item.url);
            const filename = `file_${Date.now()}.${file.extension}`;
            const message = `🍟 *Fetching* : ${Date.now() - startTime} ms`;

            if (['jpg', 'jpeg', 'png', 'webp'].includes(file.extension)) {
               await client.sendFile(m.chat, item.url, filename, message, m);
            } else {
               await client.sendFile(m.chat, item.url, 'video.mp4', message, m);
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
