
exports.run = {
   usage: ['ai'],
   use: 'prompt',
   category: 'ai',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (command == 'ai') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'hi'), m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Func.fetchJson(`https://api.betabotz.eu.org/api/search/openai-chat?text=${text}&apikey=beta-${global.betabotz}`)
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            client.reply(m.chat, json.message, m)
         } 
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: false,
   location: __filename
}
