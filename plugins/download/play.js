const { ytmp3, search } = require('@vreden/youtube_scraper');

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

         const json  = await  search(text);
         const firstResp = json.results[0]
         if (!firstResp) return client.reply(m.chat, '*Song not found 😓*', m)
         const quality = "320"
         const url  = firstResp.url
         const downResult =  await ytmp3(url, quality);
         const downUrl = downResult.download.url;
   

         let caption = `乂  *Y T - P L A Y*\n\n`
         caption += `◦ *Title* : ${firstResp.title}\n`
         caption += `◦ *Duration* : ${firstResp.timestamp}\n`
         caption += `◦ *Views* : ${firstResp.views}\n`
         caption += `◦ *Channel* : ${firstResp.author}\n`
         caption += `◦ *Views* : ${firstResp.views}\n`
         caption += `◦ *Uploaded* : ${firstResp.ago}\n\n`
         caption += global.footer

         const thumb = await Func.fetchBuffer(firstResp.thumbnail)

         await client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: firstResp.thumbnail
         })

         await client.sendFile(m.chat, downUrl, `${firstResp.title}.mp3`, '', m, {
            document: true,
            APIC: thumb
         })

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
