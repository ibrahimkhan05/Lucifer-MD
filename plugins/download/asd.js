const { ytsearch } = require('ruhend-scraper')

exports.run = {
   usage: ['hello'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      users,
      env,
      Func,
      Scraper
   }) => {
      try {
         let { video, channel } = await ytsearch("Cheery cherey lady")
      let teks = [...video, ...
         channel
      ].map(v => {
         switch (v.type) {
            case 'video':
               return `
       *${v.title}* 
       *${v.url}*
       Duration: ${v.durationH}
       Uploaded ${v.publishedTime}
       ${v.view} views`.trim()
            case 'channel':
               return `
      ╭──────━• *CHANNEL*
      │🎀 *${v.channelName}* 
      │🔗 *${v.url}*
      │📛 _${v.subscriberH} Subscriber_
      │🎥 ${v.videoCount} video
      ┗──────━•`.trim()
         }
      }).filter(v => v).join(
         '\n\n─────────────━─────────────\n\n'
      )
      console.log(teks)


      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   restrict: true,
   cache: true,
   location: __filename
}
