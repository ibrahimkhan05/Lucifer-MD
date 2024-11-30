exports.run = {
   usage: ['xvideos'],
   hidden: ['getxvideos'],
   use: 'query <𝘱𝘳𝘦𝘮𝘪𝘶𝘮>',
   category: 'porn',
   async: async (m, { client, text, args, isPrefix, command, Func }) => {
      try {
         if (command === 'xvideos') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'step mom'), m);
            client.sendReact(m.chat, '🕒', m.key);

            let json = await Func.fetchJson(`https://api.betabotz.eu.org/api/search/xvideos?query=${text}&apikey=beta-Ibrahim1209`);
            if (!json.status) return client.reply(m.chat, global.status.fail, m);

            const results = json.result; // Use all results from the API response

            // Create the carousel with video results
            const cards = results.map((result, index) => ({
                header: {
                    imageMessage: global.db.setting.cover, // Image for the card header (can be customized)
                    hasMediaAttachment: true,
                },
                body: {
                    text: `${result.title}\nDuration: ${result.duration}\nViews: ${result.views}`, // Video details
                },
                nativeFlowMessage: {
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "Watch Video", // Button text
                            id: `${isPrefix}getxvideos ${result.url}` // Trigger download with the selected video URL
                        })
                    }]
                }
            }));

            // Send carousel with the video options
            await client.sendCarousel(m.chat, cards, m, {
                content: `*X V I D E O S  S E A R C H*\n\nResults for your search: ${text}. Please select a video from the options below.`
            });

         } else if (command === 'getxvideos') {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'your link'), m);
            if (!args[0].match(/(?:https?:\/\/(www\.)?(xvideos)\.(com)\S+)?$/)) return client.reply(m.chat, global.status.invalid, m);
            client.sendReact(m.chat, '🕒', m.key);

            let json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/xvideosdl?url=${args[0]}&apikey=beta-Ibrahim1209`);
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m);

            // Build the caption with video details
            let teks = `乂  *X V I D E O S*\n\n`;
            teks += '◦  *Name* : ' + json.result.title + '\n';
            teks += '◦  *Views* : ' + json.result.views + '\n';
            teks += '◦  *Keywords* : ' + json.result.keyword + '\n';
            teks += global.footer;

            // Send the video file directly
            await client.sendFile(m.chat, json.result.url, '', teks, m);
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
