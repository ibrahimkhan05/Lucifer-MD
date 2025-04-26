const { ytmp3, search } = require('@vreden/youtube_scraper');
const axios = require('axios'); // we need axios for HEAD request

exports.run = {
   usage: ['play'],
   hidden: ['lagu', 'song'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      env,
      users,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m)

         client.sendReact(m.chat, '🕒', m.key)

         const json = await search(text);
         const firstResp = json.results[0];
         if (!firstResp) return client.reply(m.chat, '*Song not found 😓*', m);

         const quality = "320";
         const url = firstResp.url;
         const downResult = await ytmp3(url, quality);
         const downUrl = downResult.download.url;

         // 📦 Check file size using HEAD request
         const head = await axios.head(downUrl);
         const contentLength = head.headers['content-length'];
         if (!contentLength) return client.reply(m.chat, 'Failed to get file size.', m);

         const fileSizeInMB = (contentLength / (1024 * 1024)).toFixed(2); // convert bytes -> MB

         const chSize = Func.sizeLimit(fileSizeInMB, users.premium ? env.max_upload : env.max_upload_free);
         const isOver = users.premium 
            ? `💀 File size (${fileSizeInMB} MB) exceeds the maximum limit.` 
            : `⚠️ File size (${fileSizeInMB} MB), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`;

         if (chSize.oversize) return client.reply(m.chat, isOver, m);

         // 📃 Caption
         let caption = `乂  *Y T - P L A Y*\n\n`
         caption += `◦ *Title* : ${firstResp.title}\n`
         caption += `◦ *Duration* : ${firstResp.timestamp}\n`
         caption += `◦ *Views* : ${firstResp.views}\n`
         caption += `◦ *Channel* : ${firstResp.author.name}\n`
         caption += `◦ *Uploaded* : ${firstResp.ago}\n\n`
         caption += global.footer;

         const thumb = await Func.fetchBuffer(firstResp.thumbnail);

         await client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: firstResp.thumbnail
         });

         await client.sendFile(m.chat, downUrl, `${firstResp.title}.mp3`, '', m, {
            document: true,
            APIC: thumb
         });

      } catch (e) {
         console.error(e)
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}
