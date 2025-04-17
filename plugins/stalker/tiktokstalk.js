exports.run = {
   usage: ['ttstalk'],
   use: 'username',
   category: 'stalker',
   async: async (m, { client, args, isPrefix, command, Func }) => {
      try {
         if (!args || !args[0]) {
            return client.reply(m.chat, Func.example(isPrefix, command, 'hosico_cat'), m);
         }
         
         // Send a reaction to indicate processing
         client.sendReact(m.chat, '🕒', m.key);
         
         // Fetch TikTok user data using the provided API
         let json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/tools/tiktokstalk?q=${args[0]}`);
         
         if (!json.status) {
            return client.reply(m.chat, Func.texted('bold', `🚩 Account not found.`), m);
         }

         let caption = `乂  *T I K T O K  S T A L K*\n\n`;
         const user = json.result.users;
         const stats = json.result.stats;

         caption += `   ◦  *Name* : ${user.nickname}\n`;
         caption += `   ◦  *Username* : ${user.username}\n`;
         caption += `   ◦  *Bio* : ${user.signature}\n`;
         caption += `   ◦  *Videos* : ${stats.videoCount}\n`;
         caption += `   ◦  *Likes* : ${stats.heartCount}\n`;
         caption += `   ◦  *Followers* : ${stats.followerCount}\n`;
         caption += `   ◦  *Following* : ${stats.followingCount}\n`;
         caption += `   ◦  *Country* : ${user.region}\n`;
         caption += `   ◦  *Verified* : ${user.verified ? 'Yes' : 'No'}\n\n`;

         caption += global.footer;

         // Send the profile picture along with the formatted information
         client.sendFile(m.chat, user.avatarMedium, '', caption, m);
         
      } catch {
         return client.reply(m.chat, global.status.error, m);
      }
   },
   error: false,
   cache: true,
   verified: true,
   location: __filename
};
