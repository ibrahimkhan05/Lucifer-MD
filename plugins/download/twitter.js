exports.run = {
   usage: ['twitter'],
   hidden: ['tw', 'twdl'],
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
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://twitter.com/mosidik/status/1475812845249957889?s=20'), m)
         if (!args[0].match(/(twitter.com)/gi)) return client.reply(m.chat, global.status.invalid, m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const json = await Func.fetchJson(`https://bk9.fun/download/twitter-2?url=${encodeURIComponent(args[0])}`);
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)

         const media = json.BK9.BK9
         for (let item of media) {
            if (item.type === 'video') {
               client.sendFile(m.chat, item.url, 'video.mp4', `🍟 *Fetching* : ${((new Date() - old) * 1)} ms`, m)
            } else if (item.type === 'image') {
               client.sendFile(m.chat, item.url, 'image.jpg', '', m)
            }
            await Func.delay(1500)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}
