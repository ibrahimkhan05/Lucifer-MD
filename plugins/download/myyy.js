const { ytmp3 } = require('ruhend-scraper')

exports.run = {
    usage: ["myy"],
    use: "query",
    category: "generativeai",
    async: async (m, { client, isPrefix, text, Func, command }) => {
        
const url = 'https://youtu.be/fW1Cgv63naI';

const data = await ytmp3(url);
console.log(data);

     
    },
    error: false,
    limit: true,
    premium: false,
    verified: true,
};
