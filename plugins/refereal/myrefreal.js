exports.run = {
    usage: ['myreferral'],
    hidden: [''],
    use: 'Shows how many users you have referred and how much limit you have.',
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
 
          // Calculate the extra limit based on the number of referrals
          let extraLimit = referredCount * 10; // 10 for each referral
          if (user.referralUsed) {
             extraLimit += 5; // Add 5 if the user has used a referral code
          }
 
          // Total limit is base limit plus extra limit
          let totalLimit = env.limit + extraLimit;
 
          // Send the referral count and total limit to the user
          client.reply(m.chat, `You have referred ${referredCount} user(s). Your total limit is ${totalLimit}.`, m);
 
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
 