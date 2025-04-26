const SYTDL = require("s-ytdl").default;

exports.run = {
    usage: ['testttt'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func, text }) => {
        try {
            const audio = await SYTDL.dl(
                "https://youtu.be/O2QiUN-7Rjw?si=B5RCHEfk__K1ywjH",
                "4",
                "audio"
            );
            
            console.log(audio); // 🔥 This will print whatever SYTDL.dl returns
            
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, '❌ An error occurred while processing your request.', m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
};
