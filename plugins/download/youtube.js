const axios = require('axios');

exports.run = {
   usage: ['ytmp3', 'ytmp4'],
   hidden: ['yta', 'ytv'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, args, isPrefix, command, users, env }) => {
      try {
         if (/yt?(a|mp3)/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, 'Example: ' + isPrefix + command + ' https://youtu.be/zaRFmdtLhQ8', m);
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m);
            client.sendReact(m.chat, '🕒', m.key);

            // Use BetaBotz API to get the audio download link
            const response = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${args[0]}&apikey=${global.betabotz}`);

            // If API response fails
            if (!response.data.status) {
               return client.reply(m.chat, "Failed to fetch the audio. Please try again later.", m);
            }

            // Extract audio data from API response
            const audioData = response.data.result;

            // Format the caption with audio details
            let caption = `乂  *Y T - A U D I O*\n\n`;
            caption += `◦  *Title* : ${audioData.title}\n`;
            caption += `◦  *Duration* : ${audioData.duration} seconds\n\n`;
            caption += global.footer;

            // Send the audio file
            client.sendFile(m.chat, audioData.mp3, `${audioData.title}.mp3`, caption, m, {
               document: true,
               APIC: await axios.get(audioData.thumb) // Fetch image thumbnail
            });
         } else if (/yt?(v|mp4)/i.test(command)) {
            if (!args || !args[0]) return client.reply(m.chat, 'Example: ' + isPrefix + command + ' https://youtu.be/zaRFmdtLhQ8', m);
            if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(args[0])) return client.reply(m.chat, global.status.invalid, m);
            client.sendReact(m.chat, '🕒', m.key);

            // Use BetaBotz API to get the video download link
            const response = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${args[0]}&apikey=${global.betabotz}`);

            // If API response fails
            if (!response.data.status) {
               return client.reply(m.chat, "Failed to fetch the video. Please try again later.", m);
            }

            // Extract video data from API response
            const videoData = response.data.result;

            // Format the caption with video details
            let caption = `乂  *Y T - V I D E O*\n\n`;
            caption += `◦  *Title* : ${videoData.title}\n`;
            caption += `◦  *Duration* : ${videoData.duration} seconds\n`;
            caption += `◦  *Uploaded* : ${videoData.uploaded}\n`;
            caption += `◦  *Views* : ${videoData.views}\n\n`;
            caption += global.footer;

            // Check if the file size is larger than 99 MB
            let isSize = videoData.mp4Size.replace(/MB/g, '').trim();
            if (parseFloat(isSize) > 99) {
               // Send video as a document if file size exceeds 99 MB
               client.sendFile(m.chat, videoData.mp4, `${videoData.title}.mp4`, caption, m, {
                  document: true,
                  jpegThumbnail: videoData.thumb
               });
            } else {
               // Send video normally
               client.sendFile(m.chat, videoData.mp4, `${videoData.title}.mp4`, caption, m);
            }
         }
      } catch (e) {
         console.error(e); // Log the error for debugging
         client.reply(m.chat, "An error occurred. Please try again later.", m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
};
