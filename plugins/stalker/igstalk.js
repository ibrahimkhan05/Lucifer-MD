exports.run = {
   usage: ['igstalk'],
   use: 'username',
   category: 'stalker',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         // Check if a username is provided
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'erlanrahmat_14'), m);
         
         // Send a reaction to indicate processing
         client.sendReact(m.chat, '🕒', m.key);
         
         // Fetch Instagram user data using the new API
         const json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/tools/igstalk?username=${args[0]}`);
         
         // Check if the API request is successful
         if (!json.data) return client.reply(m.chat, Func.texted('bold', `🚩 Account not found.`), m);
         
         // Prepare the caption with the user data
         let caption = `乂  *I G - S T A L K*\n\n`;
         const user = json.data;
         
         caption += `   ◦  *Name* : ${user.full_name}\n`;
         caption += `   ◦  *Username* : ${user.username}\n`;
         caption += `   ◦  *Posts* : ${user.posts}\n`;
         caption += `   ◦  *Followers* : ${user.followers}\n`;
         caption += `   ◦  *Following* : ${user.following}\n`;
         caption += `   ◦  *Bio* : ${user.biography || 'N/A'}\n`;
         caption += `   ◦  *Private* : ${Func.switcher(user.private, '√', '×')}\n`;
         caption += `   ◦  *Verified* : ${user.verified ? 'Yes' : 'No'}\n\n`;
         
         caption += global.footer;

         // Send the profile picture along with the formatted information
         client.sendFile(m.chat, user.profile_picture, 'image.jpg', caption, m);
         
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
