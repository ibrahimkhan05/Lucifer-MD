const fetch = require('node-fetch');

exports.run = {
    usage: ['apkdl'],
    use: 'Google Play Store URL or App ID',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            let appId;

            // Extract App ID from Play Store URL or use the given text
            if (args[0].includes('play.google.com')) {
                const url = new URL(args[0]);
                appId = url.searchParams.get('id');
            } else {
                appId = args[0];
            }

            if (!appId) {
                return client.reply(m.chat, Func.example(isPrefix, command, 'com.whatsapp'), m);
            }

            client.sendReact(m.chat, '🕒', m.key);

            // Fetch APK details from the new API
            const apiUrl = `https://bk9.fun/download/apk?id=${appId}`;
            const response = await fetch(apiUrl);
            const json = await response.json();

            if (!json.status) {
                return client.reply(m.chat, 'Failed to fetch APK details!', m);
            }

            // Send only the APK file
            client.sendFile(m.chat, json.BK9.dllink, `${json.BK9.name}.apk`, '', m);

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
