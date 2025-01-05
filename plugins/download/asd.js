const { ytmp3 } = require('ruhend-scraper')

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
         const data = await ytmp3("http://youtu.be/e1X7jr96C6E")
         console.log(data)


      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   restrict: true,
   cache: true,
   location: __filename
}
