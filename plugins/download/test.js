const { BingImageClient } = require('bing-images')

exports.run = {
    usage: ['test'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            var buttons = [{
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
            console.error(e); // Log error for debugging
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    limit: true,
    restrict: true,
    verified: true,
    cache: true,
    location: __filename
};
