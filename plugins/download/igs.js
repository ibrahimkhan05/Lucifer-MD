exports.run = {
   usage: ['igs'],
   hidden: ['igstory'],
   use: 'username',
   category: 'downloader',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'ustazadnin'), m);
         }

         // Trim spaces but keep everything else intact
         const username = args[0].trim();
         const igUrl = `https://bk9.fun/download/igs?username=${username}`;

         client.sendReact(m.chat, '🕒', m.key);
         const startTime = Date.now();

         // Fetch the API response
         const response = await Func.fetchJson(igUrl);

         // Check if the response is valid
         if (!response || !response.status || !response.BK9 || response.BK9.length === 0) {
            return client.reply(m.chat, 'Unable to fetch the story. Please try again later.', m);
         }

         const processedUrls = new Set();
         for (const item of response.BK9) {
            if (processedUrls.has(item.url)) continue;

            processedUrls.add(item.url);
            const file = await Func.getFile(item.url);
            const filename = `file_${Date.now()}.${file.extension}`;
            const message = `🍟 *Fetching* : ${Date.now() - startTime} ms`;

            if (item.type === 'image') {
               await client.sendFile(m.chat, item.url, filename, message, m);
            } else if (item.type === 'video') {
               await client.sendFile(m.chat, item.url, 'video.mp4', message, m);
            }

            await Func.delay(1500); // To avoid too many requests in a short time
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
