exports.run = {
    usage: ['redeem'],
    hidden: [''],
    use: 'Redeems a referral code.',
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
          const isNumber = x => typeof x === 'number' && !isNaN(x);
          
          // Get referral code and remove any unwanted characters (hyphens)
          let referralCode = args[0]; // The referral code provided by the user
          referralCode = referralCode.replace(/[^a-zA-Z0-9]/g, '');  // Remove all non-alphanumeric characters

          if (!referralCode) {
             return client.reply(m.chat, 'Please provide a valid referral code.', m);
          }

          // Find the referred user by the referral code
          let referredUser = global.db.users.find(v => v.referralCode === referralCode);
          let user = global.db.users.find(v => v.jid === m.sender);

          if (!user) {
             return client.reply(m.chat, 'You are not registered, please try again later.', m);
          }

          if (user.referralCodeUsed) {
             return client.reply(m.chat, 'You have already redeemed a referral code.', m);
          }

          if (!referredUser) {
             return client.reply(m.chat, 'Invalid referral code.', m);
          }

          // Mark the referral code as used
          user.referralCodeUsed = true;
          user.referredBy = referredUser.jid;  // Record who referred the user
          referredUser.referredUsers.push(user.jid);  // Add the user to the referrer's referred users list

          // Award limit to both the referrer and the referred user
          let userLimitIncrease = 5;  // Redeeming user gets 5 more limit
          let referredUserLimitIncrease = 10;  // Referrer gets 10 more limit

          referredUser.limit += referredUserLimitIncrease;  
          user.limit += userLimitIncrease;

          // Save updated user data
          global.db.users = global.db.users.map(v => v.jid === referredUser.jid ? referredUser : v);
          global.db.users = global.db.users.map(v => v.jid === user.jid ? user : v);

          // Respond with success message to the user who redeemed the code
          client.reply(m.chat, `You have successfully redeemed a referral code!\nYour limit has been updated by +${userLimitIncrease} points.`, m);
          
          // Send a message to the referrer about their limit update
          client.reply(referredUser.jid, `Your referral code was successfully redeemed by ${user.name}!\nYour limit has been updated by +${referredUserLimitIncrease} points.`, m);
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
