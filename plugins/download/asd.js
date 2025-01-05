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
         const data = await ytsearch("Cherey chery lady")
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
