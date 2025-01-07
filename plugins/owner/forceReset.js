exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
       try {
           // Reset limits for all users
           global.db.users.filter(user => user.limit < env.limit && !user.premium).forEach(user => {
               // Reset user limit to the default or specified value
               user.limit = args[0] ? parseInt(args[0]) : env.limit;

               // Reset referral-related points
               if (user.referralCodeUsed) {
                   // User redeemed a code: add points from redeeming (default 5)
                   user.limit += env.redeemPoints || 5; // env.redeemPoints is configurable
               }
               if (user.referredUsers && user.referredUsers.length > 0) {
                   // Referrer: add points for all successful referrals (default 10 per referral)
                   user.limit += (env.referralPoints || 10) * user.referredUsers.length;
               }
           });

           // Update reset timestamp
           setting.lastReset = new Date().getTime();

           // Notify the owner/admin about the successful reset
           client.reply(m.chat, Func.texted('bold', `🚩 Successfully reset limits for free users and adjusted points for referral/redeem relationships.`), m);
       } catch (e) {
           // Handle and display errors
           client.reply(m.chat, Func.jsonFormat(e), m);
       }
   },
   owner: true,
   cache: true,
   location: __filename
};
