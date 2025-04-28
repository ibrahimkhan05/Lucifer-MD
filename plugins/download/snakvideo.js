exports.run = {
    usage: ['snakvideo'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://s.snackvideo.com/p/j9jKr9dR'), m);
 
            client.sendReact(m.chat, '🕒', m.key);
 
            let json = await Func.fetchJson(`https://api.agatz.xyz/api/snackvideodl?url=${args[0]}&apikey=${global.betabotz}`);
            
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
          let teks = `乂  *S N A K  V I D E O  D O W N L O A D E R *\n\n`
          teks += '	◦  *Name* : ' + json.data.title + '\n'
          teks += '	◦  *Creater* : ' + json.data.author + '\n'
          teks += '	◦  *Like*: ' + json.data.like + '\n'
          teks += '	◦  *Comment* : ' + json.data.comment + '\n'
          teks += '	◦  *Shares* : ' + json.data.share + '\n\n'
          teks += global.footer
          client.sendFile(m.chat, json.data.media, '', teks, m).then(() => {
             
          })
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    verified: true,
    premium: false
 };
 