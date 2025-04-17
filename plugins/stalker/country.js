exports.run = {
   usage: ['country'],
   use: 'country name',
   category: 'stalker',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         // Check if the country name is provided
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'Colombia'), m);
         
         // Send a reaction to indicate processing
         client.sendReact(m.chat, '🕒', m.key);

         // Fetch country information using the API
         const json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/tools/flaginfo?query=${args[0]}`);
         
         // Check if the API response is valid
         if (!json.status || !json.data) return client.reply(m.chat, Func.texted('bold', `🚩 Country not found.`), m);
         
         // Prepare the caption with country details
         let caption = `乂  *C O U N T R Y - S T A L K*\n\n`;
         const country = json.data;
         
         caption += `   ◦  *Country* : ${country.officialName}\n`;
         caption += `   ◦  *Capital* : ${country.capitalCity}\n`;
         caption += `   ◦  *Continent* : ${country.continent}\n`;
         caption += `   ◦  *Population* : ${country.population}\n`;
         caption += `   ◦  *Area* : ${country.area}\n`;
         caption += `   ◦  *Currency* : ${country.currency}\n`;
         caption += `   ◦  *Country Codes* : ${country.countryCodes}\n`;
         caption += `   ◦  *Calling Code* : ${country.callingCode}\n`;
         caption += `   ◦  *Description* : ${country.description}\n\n`;

         // Include the country's flag image
         caption += global.footer;
         client.sendFile(m.chat, country.image, 'flag.png', caption, m);
         
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
