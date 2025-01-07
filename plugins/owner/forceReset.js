exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
      try {
         // Process each user in the database
         global.db.users.filter(v => v.limit < env.limit && !v.premium).forEach(user => {
            // Reset user limit to the default or provided value
            user.limit = args[0] ? parseInt(args[0]) : env.limit;

            // Add points for users who redeemed a referral code
            if (user.referralCodeUsed) {
               user.limit += 5; // Add points for redeeming (default 5)
            }

            // Add points for users who referred others
            if (user.referredUsers && user.referredUsers.length > 0) {
               user.limit += 10 * user.referredUsers.length; // Add points for referrals (default 10 per referral)
            }
         });

         // Update the last reset timestamp
         setting.lastReset = new Date().getTime();

         // Notify success
         client.reply(
            m.chat,
            Func.texted('bold', `🚩 Successfully reset limits for free users and adjusted referral-related points.`),
            m
         );
      } catch (e) {
         // Log and send error details
         console.error('Error during reset:', e);
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   owner: true,
   cache: true,
   location: __filename
};
