exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
      try {
         // Process each user in the database
         global.db.users.forEach(user => {
            // Start with the base limit from env
            let finalLimit = env.limit;

            // Add points based on the number of referrals (e.g., 10 points per referral)
            finalLimit += (user.referralCount || 0) * 10;

            // Add bonus points if the user has not used a referral code
            if (user.referralCodeUsed === false) {
               finalLimit += 5; // Bonus for not using a referral code
            }

            // If the user's current limit is less than the final limit, update it
            if (user.limit < finalLimit) {
               // If args[0] is provided, override the final limit with that value, otherwise use the calculated finalLimit
               user.limit = args[0] ? parseInt(args[0]) : finalLimit;
            }
         });

         // Update the last reset timestamp
         setting.lastReset = new Date().getTime();

         // Send success message
         client.reply(
            m.chat,
            Func.texted('bold', `🚩 Successfully reset limits for free users, adjusted referral points and bonuses.`),
            m
         );
      } catch (e) {
         // Send error message
         return client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   owner: true,
   cache: true,
   location: __filename
};
