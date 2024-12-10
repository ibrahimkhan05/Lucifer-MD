
const { Youtube } = require('@neoxr/youtube-scraper')
const yt = new Youtube({
   fileAsUrl: false
})
exports.run = {
   usage: ['video'],
   hidden: ['playvid', 'playvideo'],
   use: 'query',
   category: 'feature',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      env,
      users,
      Scraper,
      Func
   }) => {
      try {
         yt.play('wide awake', 'video', '480p').then(console.log)
      
      } catch (e) {
         client.reply(m.chat, FuncjsonFormat(e), m)
      }
   },
   error: false,
   restrict: true,
   cache: true,
   location: __filename
}
