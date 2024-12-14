exports.run = {
   usage: ['fb'],
   hidden: ['fbdl', 'fbvid'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Scraper,
      env,
      Func
   }) => {
      try {
         // Validate and extract the link
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://fb.watch/7B5KBCgdO3'), m);
         if (!args[0].match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/)) return client.reply(m.chat, global.status.invalid, m);
         
         // Indicate that the bot is processing the request
         client.sendReact(m.chat, '🕒', m.key);
         
         // Fetch the video download link using the provided API
         const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/fbdown?url=${encodeURIComponent(args[0])}&apikey=${global.betabotz}`);
         if (json.status !== true || !json.result || json.result.length === 0) return client.reply(m.chat, global.status.fail, m);

         // Sort the results by resolution in descending order (from highest to lowest resolution)
         const resolutionOrder = ['1080p', '720p', '480p', '360p', '240p', '144p', '120p', '60p']; // List of possible resolutions
         
         // Filter available resolutions and sort them by resolution priority
         const availableResolutions = json.result.filter(video =>
            resolutionOrder.includes(video.resolution.split(' ')[0])
         ).sort((a, b) => {
            const indexA = resolutionOrder.indexOf(a.resolution.split(' ')[0]);
            const indexB = resolutionOrder.indexOf(b.resolution.split(' ')[0]);
            return indexB - indexA; // Sorting in descending order
         });

         // Check if there are any available resolutions
         if (availableResolutions.length === 0) {
            return client.reply(m.chat, '❌ No valid video resolutions available', m);
         }

         // Get the highest available resolution
         const highestQuality = availableResolutions[0];

         // Get the file size
         const size = await Func.getSize(highestQuality._url);
         const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free);

         // Check if the file size exceeds the user's limit
         const isOver = users.premium
            ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link: ${await (await Scraper.shorten(highestQuality._url)).data.url}`
            : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`;
         
         if (chSize.oversize) return client.reply(m.chat, isOver, m);

         // Send the highest quality video file to the user
         await client.sendFile(m.chat, highestQuality._url, Func.filename('mp4'), '', m);
         
      } catch (e) {
         console.log(e);
         return client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
};
