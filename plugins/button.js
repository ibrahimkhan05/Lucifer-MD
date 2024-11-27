exports.run = {
    usage: ['button'],
    async: async (m, {
       client,
       isPrefix,
       command,
       Func
    }) => {
       try {
         var buttons = [{
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
               display_text: "OWNER",
               id: '.owner'
            }),
         }, 
         ]
         
         // button & list
         client.sendIAMessage(m.chat, buttons, m, {
            header: '',
            content: 'Hi!',
            footer: '',
            media: global.db.setting.cover // video or image link
         })
       } catch (e) {
          client.reply(m.chat, Func.jsonFormat(e), m)
       }
    },
    error: false,
    cache: true,
    location: __filename
 }