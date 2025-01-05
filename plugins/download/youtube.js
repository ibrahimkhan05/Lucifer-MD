const axios = require('axios'); // Ensure axios is imported for making API requests

exports.run = {
   usage: ['ytmp3', 'ytmp4'],
   hidden: ['yta', 'ytv'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      env,
      Func,
      Scraper
   }) => {
      try {
         if (/yt?(a|mp3)/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)
            client.sendReact(m.chat, '🕒', m.key)

            // Fetch the video details using BetaBotz API for MP3, using global.betabotz as API key
            const response = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${args[0]}&apikey=${global.betabotz}`);

            if (!response.data.status) {
               return client.reply(m.chat, "Failed to fetch audio. Please try again later.", m);
            }

            const videoData = response.data.result;
            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `◦  *Title* : ${videoData.title}\n`;
            caption += `◦  *Size* : ${videoData.size}\n`;
            caption += `◦  *Duration* : ${videoData.duration}\n`;
            caption += `◦  *Quality* : ${videoData.quality}\n\n`;
            caption += global.footer;

            // Handle size limit for premium and free users
            const chSize = Func.sizeLimit(videoData.size, users.premium ? env.max_upload : env.max_upload_free);
            const isOver = users.premium ? `💀 File size (${videoData.size}) exceeds the maximum limit.` : `⚠️ File size (${videoData.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`;

            if (chSize.oversize) return client.reply(m.chat, isOver, m);

            // Check if the size is over 99MB
            let isSize = videoData.size.replace(/MB/g, '').trim();
            if (parseFloat(isSize) > 99) {
               return client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  thumbnail: videoData.thumb
               }).then(async () => {
                  await client.sendFile(m.chat, videoData.mp4, videoData.title + '.mp4', caption, m, {
                     document: true
                  });
               });
            }

            // If the size is under 99MB, send the video normally
            client.sendFile(m.chat, videoData.mp4, videoData.title + '.mp4', caption, m);
         } else if (/yt?(v|mp4)/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://youtu.be/zaRFmdtLhQ8'), m)
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m)

            client.sendReact(m.chat, '🕒', m.key)

            // Fetch the video details using BetaBotz API for MP4, using global.betabotz as API key
            const response = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${args[0]}&apikey=${global.betabotz}`);

            if (!response.data.status) {
               return client.reply(m.chat, "Failed to fetch video. Please try again later.", m);
            }

            const videoData = response.data.result;
            let caption = `乂  *Y T - M P 4*\n\n`;
            caption += `◦  *Title* : ${videoData.title}\n`;
            caption += `◦  *Size* : ${videoData.size}\n`;
            caption += `◦  *Duration* : ${videoData.duration}\n`;
            caption += `◦  *Quality* : ${videoData.quality}\n\n`;
            caption += global.footer;

            // Handle size limit for premium and free users
            const chSize = Func.sizeLimit(videoData.size, users.premium ? env.max_upload : env.max_upload_free);
            const isOver = users.premium ? `💀 File size (${videoData.size}) exceeds the maximum limit.` : `⚠️ File size (${videoData.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`;

            if (chSize.oversize) return client.reply(m.chat, isOver, m);

            // Check if the size is over 99MB
            let isSize = videoData.size.replace(/MB/g, '').trim();
            if (parseFloat(isSize) > 99) {
               return client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  thumbnail: videoData.thumb
               }).then(async () => {
                  await client.sendFile(m.chat, videoData.mp4, videoData.title + '.mp4', caption, m, {
                     document: true
                  });
               });
            }

            // If the size is under 99MB, send the video normally
            client.sendFile(m.chat, videoData.mp4, videoData.title + '.mp4', caption, m);
         }
      } catch (e) {
         console.error(e); // Log the error for debugging
         return client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
};
