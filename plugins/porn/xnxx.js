exports.run = {
   usage: ['search', 'download'],
   hidden: ['getsearch', 'getdownload'],
   use: 'search <query> | download <video_url>',
   category: 'porn',
   async: async (m, { client, text, args, isPrefix, command, Func }) => {
      try {
         if (command === 'search') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'query'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // API call to search for videos based on the query
            let json = await Func.fetchJson(`https://api.betabotz.eu.org/api/search/xvideos?query=${text}&apikey=beta-Ibrahim1209`);
            
            // If the API status is false, reply with failure message
            if (!json.status) return client.reply(m.chat, global.status.fail, m);

            // Create a list of cards (carousel items)
            const cards = json.result.map((v, index) => ({
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
                        id: `${isPrefix}download ${v.url}` // Trigger download with the selected video URL
                     })
                  }]
               }
            }));

            // Create a caption for the combined search result
            const combinedCaption = "*X H M A T E R   S E A R C H*\n\nHere are the results for your search: " + text + ".\n\nPlease select a video from the options below. Once you make a selection, the video will be sent to you directly.";

            // Send the carousel with the available videos as buttons
            await client.sendCarousel(m.chat, cards, m, {
               content: combinedCaption
            });

         } else if (command === 'download') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'video_url'), m);
            client.sendReact(m.chat, '🕒', m.key);

            // API call to fetch video details and download link
            let json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/xvideosdl?url=${text}&apikey=beta-Ibrahim1209`);
            
            // If the API status is false, reply with failure message
            if (!json.status) return client.reply(m.chat, global.status.fail, m);

            // Prepare caption for the video download details
            const teks = `*Download Video*\n\n`;
            teks += `◦  *Title*: ${json.result.title}\n`;
            teks += `◦  *Views*: ${json.result.views}\n`;
            teks += `◦  *Likes*: ${json.result.like_count}\n`;
            teks += `◦  *Dislikes*: ${json.result.dislike_count}\n`;
            teks += `◦  *Keywords*: ${json.result.keyword}\n`;
            teks += `◦  *Download Link*: ${json.result.url}\n\n`;
            teks += global.footer;

            // Send the formatted response to the user with the download link
            client.reply(m.chat, teks, m);
         }
      } catch (e) {
         console.log(e);
         return client.reply(m.chat, global.status.error, m);
      }
   },
   error: false,
   limit: true,
   premium: true
};
