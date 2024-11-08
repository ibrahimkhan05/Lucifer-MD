const { BingImageClient } = require('bing-images')

exports.run = {
    usage: ['test'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
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
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                         display_text: 'Contact Owner',
                         url: 'https://api.neoxr.eu',
                         webview_presentation: null
                      })
                   }]
                }
             }, {
                header: {
                   imageMessage: global.db.setting.cover,
                   hasMediaAttachment: true,
                },
                body: {
                   text: "P"
                },
                nativeFlowMessage: {
                   buttons: [{
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                         display_text: 'Contact Owner',
                         url: 'https://api.neoxr.eu',
                         webview_presentation: null
                      })
                   }]
                }
             }]
             
             client.sendCarousel(m.chat, cards, m, {
                content: 'Hi!'
             })
             Readme
             Keywords

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
