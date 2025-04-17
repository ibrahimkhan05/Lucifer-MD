exports.run = {
    usage: ['threads'],
    use: 'link',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.threads.net/@httpnald_/post/CwWvCFvJr_N/?igshid=NTc4MTIwNjQ2YQ=='), m);
 
            client.sendReact(m.chat, '🕒', m.key);
 
            const json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/download/threads?url=${encodeURIComponent(args[0])}`);
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m);
 
            const media = json.data;
 
            // Send media based on type
            for (let item of media) {
                if (item.type === 'video') {
                    client.sendFile(m.chat, item.url, 'video.mp4', '', m);
                } else {
                    client.sendFile(m.chat, item.url, 'pic.jpg', '', m);
                }
                await Func.delay(1500);
            }
 
        } catch (e) {
            console.log(e);
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    verified: true,
    location: __filename
 };
 