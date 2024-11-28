exports.run = {
    usage: ['redeem'],
    hidden: [''],
    use: 'Redeems a referral code and gives rewards.',
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
          const referralCode = args[0]; // The referral code provided by the user
 
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
 
          // Award points (or any other rewards) to the referrer and the referred user
          referredUser.points += 50;  // Referrer gets 50 points
          user.points += 20;  // Referred user gets 20 points
 
          // Save updated user data
          global.db.users = global.db.users.map(v => v.jid === referredUser.jid ? referredUser : v);
          global.db.users = global.db.users.map(v => v.jid === user.jid ? user : v);
 
          // Respond with a success message
          client.reply(m.chat, `You have successfully redeemed a referral code!\nYou earned 20 points. The referrer earned 50 points.`, m);
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
 