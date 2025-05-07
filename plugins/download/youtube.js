const { ytmp3, ytmp4 } = require('@vreden/youtube_scraper');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
   usage: ['ytmp3', 'ytmp4'],
   hidden: ['yta', 'ytv'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, args, isPrefix, command, users, env, Func }) => {
      try {
         const url = args[0];
         if (!url) return client.reply(m.chat, 'Example: ' + isPrefix + command + ' https://youtu.be/zaRFmdtLhQ8', m);
         if (!/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(url)) {
            return client.reply(m.chat, global.status.invalid, m);
         }
         client.sendReact(m.chat, '🕒', m.key);

         if (/yt?(a|mp3)/i.test(command)) {
            const downResult = await ytmp3(url, '320');
            const { title, duration, thumbnail, download } = downResult;

            let caption = `乂  *Y T - P L A Y*\n\n`
            caption += `◦ *Title* : ${firstResp.title}\n`
            caption += `◦ *Duration* : ${firstResp.duration.timestamp}\n`
            caption += `◦ *Views* : ${firstResp.views}\n`
            caption += `◦ *Channel* : ${firstResp.author.name}\n`
            caption += `◦ *Views* : ${firstResp.views}\n`
            caption += `◦ *Uploaded* : ${firstResp.ago}\n\n`
            caption += global.footer
            const thumbBuffer = await Func.fetchBuffer(thumbnail);

            await client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               thumbnail: thumbnail
            });

            await client.sendFile(m.chat, download.url, `${title}.mp3`, '', m, {
               document: true,
               APIC: thumbBuffer
            });

         } else if (/yt?(v|mp4)/i.test(command)) {
            const downResult = await ytmp4(url, '720');
            const { title, duration, thumbnail, download } = downResult;

            const fileName = `${title.replace(/[^\w\s]/gi, '')}.mp4`;
            const tmpDir = path.join(__dirname, '../tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const filePath = path.join(tmpDir, fileName);
            const writer = fs.createWriteStream(filePath);

            const response = await axios({
               method: 'GET',
               url: download.url,
               responseType: 'stream',
               headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            await new Promise((resolve, reject) => {
               response.data.pipe(writer);
               writer.on('finish', resolve);
               writer.on('error', reject);
            });

            const stats = fs.statSync(filePath);
            const sizeInMB = stats.size / 1024 / 1024;
            const limit = users.premium ? env.max_upload : env.max_upload_free;

            if (sizeInMB > limit) {
               fs.unlinkSync(filePath);
               return client.reply(m.chat, `⚠️ File size (${sizeInMB.toFixed(2)} MB) exceeds your limit of ${limit} MB.`, m);
            }

            let caption = `乂  *Y T - V I D E O*\n\n`;
            caption += `◦ *Title* : ${firstResp.title}\n`;
            caption += `◦ *Duration* : ${firstResp.duration.timestamp}\n`;
            caption += `◦ *Views* : ${firstResp.views}\n`;
            caption += `◦ *Channel* : ${firstResp.author.name}\n`;
            caption += `◦ *Uploaded* : ${firstResp.ago}\n\n`;
            caption += global.footer;
            if (sizeInMB > 99) {
               // Send as document if file size exceeds 99 MB
               return client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  thumbnail: await Func.fetchBuffer(firstResp.thumbnail)
               }).then(async () => {
                  await client.sendFile(m.chat, filePath, fileName, '', m, { document: true });
                  fs.unlinkSync(filePath); // Clean after sending
               });
            } else {
               // Send as regular file if file size is under 99 MB
               await client.sendFile(m.chat, filePath, fileName, caption, m);
               fs.unlinkSync(filePath); // Clean after sending
            }
         }

      } catch (e) {
         console.error(e);
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
};
