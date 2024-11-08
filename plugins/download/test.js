const  { bingImageClinet } = require('bing-images')

exports.run = {
    usage: ['test'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            const client = new BingImageClient({
                token: process.env.cookie,
                notify: false
                });
                
                const result = await client.getImages('cute cat')
                console.log(result)
            
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
