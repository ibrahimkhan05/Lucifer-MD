import { youtube } from "@xct007/frieren-scraper";
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
         const ArrObj = await youtube.search("rose gone mv");
console.log(ArrObj);


      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   restrict: true,
   cache: true,
   location: __filename
}
