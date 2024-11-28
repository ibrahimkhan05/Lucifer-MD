exports.run = {
    usage: ['myreferral'],
    hidden: [''],
    use: 'Shows how many users you have referred.',
    category: 'referral',
    async: async (m, {
       client,
       args,
       text,
       isPrefix,
       command,
       env,
       Scraper,
       Func
    }) => {
       try {
          // Find the user by their JID
          let user = global.db.users.find(v => v.jid === m.sender);

          if (!user) {
             return client.reply(m.chat, 'You are not registered, please try again later.', m);
          }

          // Check how many users the current user has referred
          let referredCount = user.referredUsers.length;

          // Send the count to the user
          client.reply(m.chat, `You have referred ${referredCount} user(s).`, m);

       } catch (e) {
          console.log(e);
          client.reply(m.chat, Func.jsonFormat(e), m);
       }
    },
    error: false,
    limit: true,
    restrict: true,
    cache: true,
    location: __filename
}
