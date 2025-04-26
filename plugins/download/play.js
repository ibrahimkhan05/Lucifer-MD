const { ytmp3 } = require('@vreden/youtube_scraper');

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

         const json  = await  Func.fetchJson(`https://delirius-apiofc.vercel.app/search/searchtrack?q=${text}`)
         const firstResp = json[0]
         if (!firstResp) return client.reply(m.chat, '*Song not found 😓*', m)

         const downResult =  ytmp3(firstResp.url, "320");
   

         let caption = `乂  *Y T - P L A Y*\n\n`
         caption += `◦ *Title* : ${firstResp.title}\n`
         caption += `◦ *Duration* : ${firstResp.duration.label}\n`
         caption += `◦ *Views* : ${firstResp.Metadata}\n`
         caption += `◦ *Channel* : ${firstResp.author.name}\n`
         caption += `◦ *URL* : ${firstResp.url}\n\n`
         caption += global.footer

         const thumb = await Func.fetchBuffer(video.thumbnail)

         await client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: thumb
         })

         await client.sendFile(m.chat, downloadUrl, `${video.title}.mp3`, '', m, {
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
