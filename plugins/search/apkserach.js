const gplay = require('custom-google-play-scraper');

exports.run = {
  usage: ['apk'],
  use: 'query',
  category: 'search',
  async: async (m, { client, text, args, isPrefix, command, Func }) => {
    try {
      if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'Facebook'), m);

      client.sendReact(m.chat, '🕒', m.key);

      const response = await gplay.search({
        term: text,
        num: 5, // Fetch up to 5 results
        throttle: 10
      });

      if (!response.length) return client.reply(m.chat, 'No app found!', m);

      // Get the first result
      const firstApp = response[0];

      let combinedCaption = '乂  *P L A Y S T O R E  S E A R C H*\n\nTo download, click the button below.\n\n';
      combinedCaption += `🔹 *${firstApp.title}*\n`;
      combinedCaption += `    ◦  *AppID*: ${firstApp.appId}\n`;
      combinedCaption += `    ◦  *URL*: ${firstApp.url}\n\n`;

      // Sending message with a button for downloading
      client.replyButton(m.chat, [
        {
          text: 'Download APK',
          command: `/apkdl ${firstApp.appId}`
        }
      ], m, {
        text: combinedCaption,
        footer: global.footer,
        media: firstApp.icon
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
