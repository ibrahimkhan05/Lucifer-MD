exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
      try {
         // Reset limits for free users and adjust referral points
         global.db.users.filter(v => v.limit < env.limit && !v.premium).map(user => {
            // Reset user limit to the default or specified value
            user.limit = args[0] ? parseInt(args[0]) : env.limit;

            // Adjust points for users who have redeemed a referral code
            if (user.referralCodeUsed) {
               user.limit += env.redeemPoints || 5; // Add 5 points (or custom value from env)
            }

            // Adjust points for users who referred others
            if (user.referredUsers && user.referredUsers.length > 0) {
               user.limit += (env.referralPoints || 10) * user.referredUsers.length; // Add 10 points per referral
            }
         });

         // Update the last reset timestamp
         setting.lastReset = new Date().getTime();

         // Notify success
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully reset limits for free users `), m);
      } catch (e) {
         // Handle errors
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   owner: true,
   cache: true,
   location: __filename
};
