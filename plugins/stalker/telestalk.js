exports.run = {
    usage: ['telestalk'],
    use: 'username',
    category: 'stalker',
    async: async (m, { client, args, isPrefix, command, Func }) => {
       try {
          // Check if a username is provided
          if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'sandraxxx02'), m);
          
          // Send a reaction to indicate processing
          client.sendReact(m.chat, '🕒', m.key);
          
          // Fetch Telegram user data using the new API
          const json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/tools/telegramstalk?username=${args[0]}`);
          
          // Check if the API request is successful
          if (!json.status || !json.data) return client.reply(m.chat, Func.texted('bold', `🚩 Account not found.`), m);
          
          // Prepare the caption with the user data
          let caption = `乂  *T E L E G R A M  S T A L K*\n\n`;
          const user = json.data;
          
          caption += `   ◦  *Name* : ${user.name}\n`;
          caption += `   ◦  *Username* : ${user.username}\n`;
          caption += `   ◦  *Description* : ${user.description || 'N/A'}\n`;
          caption += `   ◦  *Profile URL* : ${user.profile}\n\n`;
          
          caption += global.footer;
 
          // Send the profile picture along with the formatted information
          client.sendFile(m.chat, user.profile, 'image.jpg', caption, m);
          
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
 