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

         // Prepare card system for all results
         const cards = result.data.map((v, index) => ({
            header: {
                imageMessage: global.db.setting.cover, // Set the image for the card header
                hasMediaAttachment: true,
            },
            body: {
                text: `${v.title} (${v.duration})\nViews: ${v.views}, HD: ${v.hd}, Premium: ${v.premium}`,
            },
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: `Download ${v.title}`,
                        id: `${isPrefix}ytdl ${v.url}` // Trigger download with the selected video URL
                    })
                }]
            }
        }));

         // Create a caption for the combined search result
         const combinedCaption = "*P O R N H U B   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video from the options below. Once you make a selection, the video will be sent to you directly.";

         // Send carousel with the available videos as buttons
         await client.sendCarousel(m.chat, cards, m, {
            content: combinedCaption
         });

      } catch (e) {
         console.log(e);
         return client.reply(m.chat, global.status.error, m);
      }
   },
   error: false,
   limit: true,
   premium: true
}
