exports.run = {
    usage: ['likee'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://l.likee.video/v/tmj1oh'), m);

            client.sendReact(m.chat, '🕒', m.key);

            // Fetch response from the new API
            let json = await Func.fetchJson(`https://bk9.fun/download/likee?url=${args[0]}`);
            
            if (!json.status) return client.reply(m.chat, 'Unable to fetch the video. Please try again.', m);
            
            const { title, thumbnail, withoutwatermark } = json.BK9;

            // Prepare message with title and thumbnail
            const message = `📹 *Title:* ${title}\n🔍 *Thumbnail:* ${thumbnail}`;

            // Use the video URL without the watermark
            const videoUrl = withoutwatermark;

            // Send the video without the watermark
            await client.sendFile(m.chat, videoUrl, 'video.mp4', message, m);
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, 'An error occurred while processing your request.', m);
        }
    },
    error: false,
    limit: true,
    verified: false,
    premium: false
};
