exports.run = {
    usage: ['xstalk'],
    use: 'username',
    category: 'stalker',
    async: async (m, { client, args, isPrefix, command, Func }) => {
       try {
          // Check if a username is provided
          if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'jennierubyjane'), m);
 
          // Send a reaction to indicate processing
          client.sendReact(m.chat, '🕒', m.key);
 
          // Fetch X user data using the provided API
          const json = await Func.fetchJson(`https://delirius-apiofc.vercel.app/tools/xstalk?username=${args[0]}`);
          
          // Check if the API request is successful
          if (!json.status || !json.data) return client.reply(m.chat, Func.texted('bold', `🚩 Account not found.`), m);
          
          // Prepare the caption with the user data
          let caption = `乂  *X (formerly Twitter)  S T A L K*\n\n`;
          const user = json.data;
          
          caption += `   ◦  *Name* : ${user.name}\n`;
          caption += `   ◦  *Username* : ${user.username}\n`;
          caption += `   ◦  *Description* : ${user.description || 'N/A'}\n`;
          caption += `   ◦  *Followers* : ${user.followers_count}\n`;
          caption += `   ◦  *Following* : ${user.following_count}\n`;
          caption += `   ◦  *Tweets* : ${user.tweets_count}\n`;
          caption += `   ◦  *Favourites* : ${user.favourites_count}\n`;
          caption += `   ◦  *Created On* : ${user.created}\n`;
          caption += `   ◦  *Verified* : ${Func.switcher(user.verified, '√', '×')}\n\n`;
          caption += `   ◦  *Profile URL* : ${user.url}\n`;
 
          caption += global.footer;
 
          // Send the user's avatar and banner with the formatted information
          client.sendFile(m.chat, user.avatar, 'avatar.jpg', caption, m);
          client.sendFile(m.chat, user.banner, 'banner.jpg', '', m);
          
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
 