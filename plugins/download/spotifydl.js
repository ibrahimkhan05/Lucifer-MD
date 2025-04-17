const axios = require('axios'); // Import axios library

exports.run = {
    usage: ['spotifydl'],
    use: 'song name/url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'song name or URL'), m);

            client.sendReact(m.chat, '🕒', m.key);

            const input = args.join(' ');

            // Regular expression to check if the input is a Spotify track URL
            const trackUrlPattern = /^(?:https?:\/\/)?(?:open\.spotify\.com\/track\/)[a-zA-Z0-9]+$/;

            let downloadResponse;

            if (trackUrlPattern.test(input)) {
                // If it's a valid Spotify track URL, fetch the download link directly
                downloadResponse = await Func.fetchJson(`https://delirius-apiofc.vercel.app/download/spotifydlv3?url=${encodeURIComponent(input)}`);
            } else {
                // If it's not a URL, search for the song
                const searchResponse = await axios.get(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(input)}&limit=1`);
                
                if (!searchResponse.data.status) return client.reply(m.chat, global.status.fail, m);
                
                // Get the first result from the search response
                const firstResult = searchResponse.data.data[0];
                if (!firstResult) return client.reply(m.chat, 'No results found', m);

                // Fetch the song download link using the first result's URL
                downloadResponse = await Func.fetchJson(`https://delirius-apiofc.vercel.app/download/spotifydlv3?url=${encodeURIComponent(firstResult.url)}`);
            }

            if (!downloadResponse.status || !downloadResponse.data || !downloadResponse.data.url) {
                return client.reply(m.chat, global.status.fail, m);
            }

            // Prepare message text
            const songData = downloadResponse.data;
            const mediaUrl = songData.url;
            const title = songData.title;
            const author = songData.author;
            const imageUrl = songData.image;

            // Send the media (MP3 file) along with its metadata
            client.sendFile(m.chat, mediaUrl, `${title} - ${author}.mp3`, `${title} - ${author}`, m, {
                document: true,
                APIC: imageUrl
            });

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
