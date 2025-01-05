const { ytsearch } = require('ruhend-scraper');
const axios = require('axios'); // Ensure axios is imported for making API requests

exports.run = {
   usage: ['video'],
   hidden: ['playvid', 'playvideo'],
   use: 'query',
   category: 'feature',
   async: async (m, { client, text, isPrefix, command, users, env, Scraper, Func }) => {
      try {
         // If no query is provided, return an example usage
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'song name'), m);

         // Send a reaction to indicate the process is running
         client.sendReact(m.chat, '🕒', m.key);

         // Search for the video using 'ruhend-scraper' API
         const result = await ytsearch(text);

         // If no results are found, return a message indicating the same
         if (!result || !result.video || result.video.length === 0) {
            return client.reply(m.chat, "No results found for your search.", m);
         }

         // Get the first video from the search result
         const firstResult = result.video[0];

         // Use the BetaBotz API to fetch the MP4 download link
         const response = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${firstResult.url}&apikey=hehenowcopy`);

         // If the API call fails, return an error message
         if (!response.data.status) {
            return client.reply(m.chat, "Failed to fetch the video. Please try again later.", m);
         }

         // Extract video details from the response
         const videoData = response.data.result;

         // Format the caption with video details
         let caption = `乂  *Y T - V I D E O*\n\n`;
         caption += `◦  *Title* : ${videoData.title}\n`;
         caption += `◦  *Duration* : ${videoData.duration} seconds\n`; // Shortened description
         caption += `◦  *Uploaded* : ${firstResult.publishedTime}\n`;
         caption += `◦  *Views* : ${firstResult.view}\n\n`;

         // Check if the mp4Size is available and valid
         if (videoData.mp4Size) {
            let isSize = videoData.mp4Size.replace(/MB/g, '').trim();
            if (parseFloat(isSize) > 99) {
               // Send the video as a document if file size exceeds 99 MB
               client.sendFile(m.chat, videoData.mp4, videoData.title + '.mp4', caption, m, {
                  document: true,
                  jpegThumbnail: videoData.thumb
               });
            } else {
               // Send the video directly if file size is less than 99 MB
               client.sendFile(m.chat, videoData.mp4, videoData.title + '.mp4', caption, m);
            }
         } else {
            // If mp4Size is not available, fallback to direct video download
            client.sendFile(m.chat, videoData.mp4, videoData.title + '.mp4', caption, m);
         }

      } catch (e) {
         console.error(e); // Log the error for debugging
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   restrict: true,
   cache: true,
   location: __filename
};
