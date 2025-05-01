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

         // Notify user file is being downloaded
         await client.reply(m.chat, '*🔄 Please wait, your file is being downloaded. This may take some time...*', m);

         // Search video
         const json = await search(text);
         const firstResp = json.results[0];
         if (!firstResp) return client.reply(m.chat, '*Video not found 😓*', m);

         const quality = "720";
         const url = firstResp.url;

         // Get video download info
         const downResult = await ytmp4(url, quality);
         const downUrl = downResult.download.url;

         // Clean filename
         const fileName = `${firstResp.title.replace(/[^\w\s]/gi, '')}.mp4`;
         const tmpDir = path.join(__dirname, '../tmp');
         if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

         const filePath = path.join(tmpDir, fileName);
         const writer = fs.createWriteStream(filePath);

         // Download video to disk
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

         // Get real file size
         const stats = fs.statSync(filePath);
         const sizeInMB = stats.size / 1024 / 1024;

         // Custom file size check
         const limit = users.premium ? env.max_upload : env.max_upload_free;
         if (sizeInMB > limit) {
            fs.unlinkSync(filePath); // cleanup
            return client.reply(m.chat, `⚠️ File size (${sizeInMB.toFixed(2)} MB) exceeds your limit of ${limit} MB.`, m);
         }

         // Build caption
         let caption = `乂  *Y T - P L A Y*\n\n`;
         caption += `◦ *Title* : ${firstResp.title}\n`;
         caption += `◦ *Duration* : ${firstResp.duration.timestamp}\n`;
         caption += `◦ *Views* : ${firstResp.views}\n`;
         caption += `◦ *Channel* : ${firstResp.author.name}\n`;
         caption += `◦ *Uploaded* : ${firstResp.ago}\n\n`;
         caption += global.footer;

         // Decide to send as document or direct
         const sendOpts = sizeInMB > 99
            ? { document: true, jpegThumbnail: firstResp.thumbnail }
            : {};

         await client.sendFile(m.chat, filePath, fileName, caption, m, sendOpts);

         fs.unlinkSync(filePath); // Clean after sending

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
