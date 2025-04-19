exports.run = {
   usage: ['ipinfo'],
   use: 'IP address',
   category: 'stalker',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         // Check if the IP address is provided
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, '8.8.8.8'), m);
         }

         // Send a reaction to indicate processing
         client.sendReact(m.chat, '🕒', m.key);

         // Fetch IP address information using the API
         const json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/tools/ipinfo?ip=${args[0]}`);

         // Check if the API response is valid
         if (!json.status || !json.data) {
            return client.reply(m.chat, Func.texted('bold', `🚩 IP address not found.`), m);
         }

         // Prepare the caption with IP address details
         let caption = `乂  *I P - I N F O*\n\n`;
         const ipInfo = json.data;

         caption += `   ◦  *IP Address* : ${ipInfo.query}\n`;
         caption += `   ◦  *Country* : ${ipInfo.country}\n`;
         caption += `   ◦  *Region* : ${ipInfo.regionName}\n`;
         caption += `   ◦  *City* : ${ipInfo.city}\n`;
         caption += `   ◦  *Continent* : ${ipInfo.continent}\n`;
         caption += `   ◦  *Timezone* : ${ipInfo.timezone}\n`;
         caption += `   ◦  *Latitude* : ${ipInfo.lat}\n`;
         caption += `   ◦  *Longitude* : ${ipInfo.lon}\n`;
         caption += `   ◦  *ISP* : ${ipInfo.isp}\n`;
         caption += `   ◦  *Organization* : ${ipInfo.org}\n`;
         caption += `   ◦  *Hosting* : ${ipInfo.hosting ? 'Yes' : 'No'}\n\n`;

         // Include the footer and send the reply as a proper message object
         caption += global.footer;
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
