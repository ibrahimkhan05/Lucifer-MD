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

           // Ensure a referral code is provided and sanitize it
           let referralCode = args[0];
           if (!referralCode) {
               return client.reply(m.chat, 'Please provide a valid referral code.', m);
           }

           // Remove any unwanted characters (hyphens, spaces, etc.)
           referralCode = referralCode.replace(/[^a-zA-Z0-9]/g, ''); // Remove all non-alphanumeric characters

           // Find the referrer and the user who is redeeming the code
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

           if (referredUser.jid === user.jid) {
               return client.reply(m.chat, 'You cannot redeem your own referral code.', m);
           }

           // Mark the referral code as used
           user.referralCodeUsed = true;
           user.referredBy = referredUser.jid;
           referredUser.referredUsers.push(user.jid);

           // Increase limits for both users (Referrer gets 10 points, Redeemer gets 5 points)
           let referrerLimitIncrease = 10; // 10 points for the referrer
           let userLimitIncrease = 5; // 5 points for the redeeming user

           // Adding 5 points to the redeeming user's limit
           user.limit += userLimitIncrease;

           // Adding 10 points to the referrer's limit (the one whose code is used)
           referredUser.limit += referrerLimitIncrease;

           // Increment the referral count for the referrer
           referredUser.referralCount = (referredUser.referralCount || 0) + 1;

           // Save the updated data
           global.db.users = global.db.users.map(v => v.jid === referredUser.jid ? referredUser : v);
           global.db.users = global.db.users.map(v => v.jid === user.jid ? user : v);

           // Notify the redeeming user
           client.reply(m.chat, `You have successfully redeemed a referral code!\nYour limit has been updated by +${userLimitIncrease} points.`, m);

           // Notify the referrer
           client.reply(referredUser.jid, `Congratulations! Your referral code was successfully redeemed by ${user.name}.\nYour limit has been updated by +${referrerLimitIncrease} points.\nYour referral count has been updated to ${referredUser.referralCount}.`, m);

       } catch (e) {
           console.log(e);
           client.reply(m.chat, Func.jsonFormat(e), m);
       }
   },
   error: false,
   limit: false,
   restrict: true,
   cache: true,
   location: __filename
}
