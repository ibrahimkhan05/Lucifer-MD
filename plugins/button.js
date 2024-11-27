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
         }, {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
               display_text: "Rest API",
               url: "https://api.neoxr.my.id",
               merchant_url: "https://api.neoxr.my.id"
            })
         }, {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
               display_text: "Copy",
               copy_code: "123456"
            })
         }, {
            name: "cta_call",
            buttonParamsJson: JSON.stringify({
               display_text: "Call",
               phone_number: "6285887776722"
            })
         }, {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
               title: "Tap!",
               sections: [{
                  rows: [{
                     title: "Owner",
                     description: `X`,
                     id: `.owner`
                  }, {
                     title: "Runtime",
                     description: `Y`,
                     id: `.run`
                  }]
               }]
            })
         }]
         
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