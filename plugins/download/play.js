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
         const downResult =  await ytmp3(firstResp.url, "320");
         
   

         let caption = `乂  *Y T - P L A Y*\n\n`
         caption += `◦ *Title* : ${firstResp.title}\n`
         caption += `◦ *Duration* : ${firstResp.duration.timestamp}\n`
         caption += `◦ *Views* : ${firstResp.views}\n`
         caption += `◦ *Channel* : ${firstResp.author.name}\n`
         caption += `◦ *Views* : ${firstResp.views}\n`
         caption += `◦ *Uploaded* : ${firstResp.ago}\n\n`
         caption += global.footer

         

         await client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: firstResp.thumbnail
         })

         await client.sendFile(m.chat, downResult.download.url, `${firstResp.title}.mp3`, '', m, {
            document: true,
            APIC: firstResp.thumbnail
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
