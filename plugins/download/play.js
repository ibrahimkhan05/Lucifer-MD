const { ytsearch } = require('ruhend-scraper');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.run = {
    usage: ['play'],
    use: 'query',
    category: 'downloader',
    async: async (m, { client, text, isPrefix, command, Func }) => {
        try {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'song name'), m);
            
            client.sendReact(m.chat, '🕒', m.key);
            
            const result = await ytsearch(text);
            if (!result || !result.video || result.video.length === 0) {
                return client.reply(m.chat, "No results found for your search.", m);
            }
            
            const firstResult = result.video[0];
            let caption = `乂  *Y T - P L A Y*\n\n`;
            caption += `◦  *Title* : ${firstResult.title}\n`;
            caption += `◦  *URL* : ${firstResult.url}\n`;
            caption += `◦  *Duration* : ${firstResult.duration}\n`;
            caption += `◦  *Uploaded* : ${firstResult.publishedTime}\n`;
            caption += `◦  *Views* : ${firstResult.view}\n`;
            
            client.sendMessageModify(m.chat, caption, m, {
                largeThumb: true,
                thumbnail: firstResult.thumbnail
            }).then(async () => {
                try {
                    const apiUrl = `https://api.betabotz.eu.org/api/download/yt?url=${firstResult.url}&apikey=${global.betabotz}`;
                    const response = await axios.get(apiUrl);
                    
                    if (!response.data.status) {
                        return client.reply(m.chat, "Failed to fetch the audio. Please try again later.", m);
                    }
                    
                    const data = response.data.result;
                    const filePath = path.join(__dirname, `${data.title}.mp3`);
                    
                    const writer = fs.createWriteStream(filePath);
                    const audioStream = await axios({
                        url: data.mp3,
                        method: 'GET',
                        responseType: 'stream'
                    });
                    
                    audioStream.data.pipe(writer);
                    
                    writer.on('finish', async () => {
                        await client.sendFile(m.chat, filePath, `${data.title}.mp3`, '', m, {
                            document: true,
                            APIC: await Func.fetchBuffer(data.thumb)
                        });
                        fs.unlinkSync(filePath);
                    });
                    
                } catch (error) {
                    console.error(error);
                    client.reply(m.chat, "Error fetching audio file. Please try again later.", m);
                }
            });
        } catch (e) {
            console.error(e);
            client.reply(m.chat, Func.jsonFormat(e), m);
        }
    },
    error: false,
    restrict: true,
    cache: true,
    location: __filename
};
