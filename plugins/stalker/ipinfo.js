exports.run = {
   usage: ['ipinfo'],
   use: 'IP address',
   category: 'stalker',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, '8.8.8.8'), m);
         }

         client.sendReact(m.chat, '🕒', m.key);

         const json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/tools/ipinfo?ip=${args[0]}`);

         if (!json.status || !json.data) {
            return client.reply(m.chat, Func.texted('bold', `🚩 IP address not found.`), m);
         }

         const ipInfo = json.data;
         let caption = `乂  *I P - I N F O*\n\n`;

         // Loop through all key-value pairs
         for (let key in ipInfo) {
            let label = key.replace(/([A-Z])/g, ' $1') // add space before capital letters
                           .replace(/^./, str => str.toUpperCase()); // capitalize first letter
            caption += `   ◦  *${label}* : ${ipInfo[key]}\n`;
         }

         caption += `\n${global.footer}`;
         await client.sendMessage(m.chat, { text: caption }, { quoted: m });

      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
};
