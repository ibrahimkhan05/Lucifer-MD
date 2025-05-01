const { ytmp4, search } = require('@vreden/youtube_scraper');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

exports.run = {
   usage: ['video'],
   hidden: ['playvid', 'playvideo'],
   use: 'query',
   category: 'feature',
   async: async (m, { client, text, isPrefix, command, users, env, Scraper, Func }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'song name'), m);

         client.sendReact(m.chat, '🕒', m.key);

         // Search YouTube
         const json = await search(text);
         const firstResp = json.results[0];
         if (!firstResp) return client.reply(m.chat, '*Video not found 😓*', m);

         const quality = "720";
         const url = firstResp.url;

         // Download video via ytmp3
         const downResult = await ytmp4(url, quality);
         const downUrl = downResult.download.url;

         // Download file to server
         const fileName = `${firstResp.title.replace(/[^\w\s]/gi, '')}.mp4`;
         const filePath = path.join(__dirname, '../tmp', fileName);
         const writer = fs.createWriteStream(filePath);
         const response = await axios({
            method: 'GET',
            url: downUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
         });

         await new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
         });

         // Get file size from disk
         const stats = fs.statSync(filePath);
         const sizeInMB = stats.size / 1024 / 1024;

         const chSize = Func.sizeLimit(sizeInMB, users.premium ? env.max_upload : env.max_upload_free);
         const isOver = users.premium 
            ? `💀 File size (${sizeInMB.toFixed(2)} MB) exceeds the maximum limit.` 
            : `⚠️ File size (${sizeInMB.toFixed(2)} MB), you can only download files up to ${env.max_upload_free} MB (or ${env.max_upload} MB for premium users).`;
         if (chSize.oversize) {
            fs.unlinkSync(filePath); // clean up
            return client.reply(m.chat, isOver, m);
         }

         // Caption
         let caption = `乂  *Y T - P L A Y*\n\n`;
         caption += `◦ *Title* : ${firstResp.title}\n`;
         caption += `◦ *Duration* : ${firstResp.duration.timestamp}\n`;
         caption += `◦ *Views* : ${firstResp.views}\n`;
         caption += `◦ *Channel* : ${firstResp.author.name}\n`;
         caption += `◦ *Uploaded* : ${firstResp.ago}\n\n`;
         caption += global.footer;

         // Send file
         const sendOpts = sizeInMB > 99
            ? { document: true, jpegThumbnail: firstResp.thumbnail }
            : {};

         await client.sendFile(m.chat, filePath, fileName, caption, m, sendOpts);

         // Optional: delete the file after sending
         fs.unlinkSync(filePath);

      } catch (e) {
         console.error(e);
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   restrict: true,
   cache: true,
   location: __filename
};
