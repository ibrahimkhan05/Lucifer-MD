exports.run = {
   usage: ['owner'],
   category: 'miscs',
   async: async (m, {
      client,
      env,
      Func
   }) => {
      client.sendContact(m.chat, [{
         name: env.owner_name,
         number: env.owner,
         about: 'Ibrahim Khan'
      }], m, {
         org: 'CloudSync',
         website: 'https://lucifercloud.app',
         email: 'contact@lucifercloud.app'
      })
   },
   error: false,
   cache: true,
   location: __filename
}