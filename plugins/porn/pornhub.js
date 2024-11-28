const { PornHub } = require('pornhub.js'); // Import the PornHub class
const pornhub = new PornHub(); // Create an instance of the PornHub class

exports.run = {
   usage: ['pornhub'],
   hidden: ['getpornhub'],
   use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
   category: 'porn',
   async: async (m, { client, text, args, isPrefix, command, Func }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'step mom'), m);
         client.sendReact(m.chat, '🕒', m.key);

         const result = await pornhub.searchVideo(text); // Use the PornHub instance to search for videos

         if (!result.data || result.data.length === 0) {
            return client.reply(m.chat, global.status.fail, m);
         }

         // Prepare carousel for all results
         const carousel = result.data.map((v) => ({
            header: {
               imageMessage: {
                  url: v.thumbnail, // Display video thumbnail as the header image
                  caption: v.title,  // Video title as the caption
               },
               hasMediaAttachment: true,
            },
            body: {
               text: `${v.title} (${v.duration})\nViews: ${v.views}, HD: ${v.hd}, Premium: ${v.premium}`,
            },
            nativeFlowMessage: {
               buttons: [{
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                     display_text: "Select Quality",
                     id: `${isPrefix}selectquality ${v.url}` // ID for quality selection
                  })
               }]
            }
         }));

         // Send the carousel with the videos
         await client.sendCarousel(m.chat, carousel, m, {
            content: "*P O R N H U B   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video to proceed."
         });

      } catch (e) {
         console.log(e);
         return client.reply(m.chat, global.status.error, m);
      }
   },
   error: false,
   limit: true,
   premium: true
};

// Function to handle quality selection for the selected video
exports.selectquality = {
   async run(m, { client, text, isPrefix, command }) {
      try {
         if (!text) {
            return client.reply(m.chat, `Usage: ${isPrefix}${command} <video_url>`, m);
         }

         const videoUrl = text.split(' ')[0]; // Extract URL from the input

         // Fetch video details (you may need to implement a method to fetch quality options here)
         const result = await pornhub.getVideoInfo(videoUrl);

         if (!result) {
            return client.reply(m.chat, "Error fetching video details.", m);
         }

         // Example of formats or qualities (you can adjust based on available info)
         const qualities = result.qualities || [{ label: "HD", id: "hd" }, { label: "SD", id: "sd" }];

         if (qualities.length === 0) {
            return client.reply(m.chat, "No qualities available for this video.", m);
         }

         // Prepare carousel for quality selection
         const qualityCarousel = qualities.map((quality) => ({
            header: {
               imageMessage: {
                  url: global.db.setting.cover, // You can set a default cover image
                  caption: `Select ${quality.label} Quality`,
               },
               hasMediaAttachment: true,
            },
            body: {
               text: `Choose the ${quality.label} quality for the video.`
            },
            nativeFlowMessage: {
               buttons: [{
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                     display_text: `${quality.label}`,
                     id: `${isPrefix}cvbi ${videoUrl} ${quality.id}` // ID for quality selection
                  })
               }]
            }
         }));

         // Send the carousel with quality options
         await client.sendCarousel(m.chat, qualityCarousel, m, {
            content: "*P O R N H U B   S E A R C H*\n\nSelect the quality you prefer for the video."
         });

      } catch (e) {
         console.log(e);
         return client.reply(m.chat, global.status.error, m);
      }
   }
};
