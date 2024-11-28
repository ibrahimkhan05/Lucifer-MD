
exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
      const cards = [{
         header: {
            imageMessage: global.db.setting.cover,
            hasMediaAttachment: true,
         },
         body: {
            text: "P"
         },
         nativeFlowMessage: {
            buttons: [{
               name: "quick_reply",
               buttonParamsJson: JSON.stringify({
                  display_text: "OWNER",
                  id: ".owner"
               })
            }]
         }
         
      }, ]
      
      client.sendCarousel(m.chat, cards, m, {
         content: 'Hi!'
      })
    },
    error: false
};
