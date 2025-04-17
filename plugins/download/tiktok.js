exports.run = {
    usage: ['tiktok', 'tikmp3', 'tikwm', 'ttslide'],
    hidden: ['tt'],
    use: 'link',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://vm.tiktok.com/ZSR7c5G6y/'), m);
            if (!args[0].match('tiktok.com')) return client.reply(m.chat, global.status.invalid, m);

            client.sendReact(m.chat, '🕒', m.key);

            let old = new Date();
            const json = await Func.fetchJson(`https://bk9.fun/download/tiktok2?url=${encodeURIComponent(args[0])}`);
            if (!json.status) return m.reply(Func.jsonFormat(json));

            // If the command is 'tiktok' or 'tt' (download video no watermark)
            if (command === 'tiktok' || command === 'tt') {
                client.sendFile(m.chat, json.BK9.video.noWatermark, 'video.mp4', `🍟 *Fetching* : ${((new Date() - old) * 1)} ms`, m);
            }

            // If the command is 'tikmp3' (download audio)
            if (command === 'tikmp3') {
                if (!json.BK9.audio) {
                    return client.reply(m.chat, global.status.fail, m);
                } else {
                    client.sendFile(m.chat, json.BK9.audio, 'audio.mp3', '', m);
                }
            }

            // If the command is 'tikwm' (download video with watermark)
            if (command === 'tikwm') {
                client.sendFile(m.chat, json.BK9.video.withWatermark, 'video.mp4', `🍟 *Fetching* : ${((new Date() - old) * 1)} ms`, m);
            }
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    limit: true,
    cache: true,
    location: __filename
};
