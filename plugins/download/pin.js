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
         
         // Fetch media details from the provided Pinterest URL
         const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/pinterest?url=${encodeURIComponent(args[0])}&apikey=${global.betabotz}`);
         
         // Check if the response is valid and contains the expected data
         if (!json || !json.result || !json.result.success) {
            return client.reply(m.chat, '⚠️ Failed to fetch media details. Please check the URL or try again later.', m);
         }
         
         const { data } = json.result;
         let mediaUrl = data.image;

         // Handle different media types
         if (data.media_type === 'image') {
            // If the media is an image, send the image file
            client.sendFile(m.chat, mediaUrl, '', '', m);
         } else if (data.media_type === 'video') {
            // If the media is a video, use the video URL (ensure the URL is video type)
            mediaUrl = data.video || mediaUrl; // Fallback to image URL if no video URL is provided
            client.sendFile(m.chat, mediaUrl, '', '', m);
         } else {
            // If the media type is not recognized, return an invalid media response
            return client.reply(m.chat, '⚠️ Unsupported media type. Only image and video types are supported.', m);
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
