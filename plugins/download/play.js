const yts = require('yt-search')
const ddownr = require('denethdev-ytmp3')

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

         client.sendReact(m.chat, '🧠', m.key)

         const search = await yts(text)
         const video = search.videos[0]
         if (!video) return client.reply(m.chat, '*Song not found 😓*', m)

         const dl = await ddownr.download(video.url, 'mp3')
         const downloadUrl = dl.downloadUrl

         let caption = `乂  *Y T - P L A Y*\n\n`
         caption += `◦ *Title* : ${video.title}\n`
         caption += `◦ *Duration* : ${video.timestamp}\n`
         caption += `◦ *Views* : ${video.views.toLocaleString()}\n`
         caption += `◦ *Channel* : ${video.author.name}\n`
         caption += `◦ *URL* : ${video.url}\n\n`
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
