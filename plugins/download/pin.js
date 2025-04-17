const { decode } = require('html-entities');

exports.run = {
   usage: ['pin'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         // Validate if URL is provided and matches Pinterest URL format
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://pin.it/5fXaAWE'), m);
         if (!args[0].match(/pin(?:terest)?(?:\.it|\.com)/)) return client.reply(m.chat, global.status.invalid, m);
         
         // Indicate that the bot is processing the request
         client.sendReact(m.chat, '🕒', m.key);
         
         // Fetch media details from the provided Pinterest URL using the new API
         const json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/download/pinterestdl?url=${encodeURIComponent(args[0])}`);
         
         // Check if the response is valid and contains the expected data
         if (!json || !json.status || !json.data || !json.data.download || !json.data.download.url) {
            return client.reply(m.chat, '⚠️ Failed to fetch media details. Please check the URL or try again later.', m);
         }
         
         // Extract the media URL
         const mediaUrl = json.data.download.url;
         
         // Check if the media is a video and send accordingly
         if (mediaUrl.endsWith('.mp4')) {
            client.sendFile(m.chat, mediaUrl, '', '', m);
         } else {
            // If it's an image, send the thumbnail (or another image) URL
            client.sendFile(m.chat, json.data.thumbnail, '', '', m);
         }
      } catch (e) {
         // Handle any errors and send the error response
         console.log(e);
         return client.reply(m.chat, '⚠️ An error occurred while processing the request. Please try again later.', m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
};
