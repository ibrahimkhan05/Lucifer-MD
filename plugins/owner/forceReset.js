exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
      try {
         // Ensure env.limit is set correctly or use a fallback value
         const baseLimit = env.limit || 15; // Default to 15 if undefined

         // Process each user in the database
         global.db.users.forEach(user => {
            // Skip invalid users
            if (!user || !user.jid || user.limit === undefined) {
               console.log('Invalid user, skipping: ', user);
               return;
            }

            // Log the current state of the user
            console.log(`User ${user.jid} - Current Limit: ${user.limit}, Referral Code Used: ${user.referralCodeUsed}, Referral Count: ${user.referralCount}`);

            // Start with the base limit from env
            let finalLimit = baseLimit;

            // Add points based on the number of referrals (10 points per referral)
            finalLimit += (user.referralCount || 0) * 10;

            // Log after adding referral points
            console.log(`User ${user.jid} - Base Limit: ${baseLimit}, Referral Count: ${user.referralCount}, Final Limit after Referral Points: ${finalLimit}`);

            // Add bonus points if the user has not used a referral code
            if (user.referralCodeUsed === false) {
               finalLimit += 5; // Bonus for not using a referral code
               console.log(`User ${user.jid} - Referral Code Not Used, Adding 5 Bonus Points`);
            }

            // Log the final limit after all logic
            console.log(`User ${user.jid} - Final Limit (after all adjustments): ${finalLimit}`);

            // If the user's current limit is less than the final limit, update it
            if (user.limit < finalLimit) {
               const newLimit = args[0] ? parseInt(args[0]) : finalLimit;
               console.log(`User ${user.jid} - Updating limit from ${user.limit} to ${newLimit}`);
               user.limit = newLimit;
            }
         });

         // Update the last reset timestamp
         setting.lastReset = new Date().getTime();

         // Send success message
         client.reply(
            m.chat,
            Func.texted('bold', `🚩 Successfully reset limits for all users, adjusted referral points and bonuses.`),
            m
         );
      } catch (e) {
         // Send error message
         console.error('Error during reset:', e);
         return client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   owner: true,
   cache: true,
   location: __filename
};
