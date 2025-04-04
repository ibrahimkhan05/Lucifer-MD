exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
      try {
         // Ensure env.limit is set correctly or use a fallback value
         const baseLimit = env.limit || 15; // Fallback to 15 if undefined

         // Process each user in the database
         global.db.users.forEach(user => {
            if (!user) {
               console.log("User object is undefined");
               return; // Skip undefined users
            }

            // Check if the user has the required properties
            if (user.id === undefined || user.limit === undefined) {
               console.log(`User ${user.id} is missing required properties:`, user);
               return; // Skip this user if they are missing properties
            }

            // Start with the base limit from env (defaulted to 15 if undefined)
            let finalLimit = baseLimit;

            // Add points based on the number of referrals (10 points per referral)
            finalLimit += (user.referralCount || 0) * 10;

            // Add bonus points if the user has not used a referral code
            if (user.referralCodeUsed === false) {
               finalLimit += 5; // Bonus for not using a referral code
            }

            // Debug log: Check final limit calculation
            console.log(`User ${user.id} - Final Limit (after referral logic): ${finalLimit}`);

            // If the user's current limit is less than the final limit, update it
            if (user.limit < finalLimit) {
               // If args[0] is provided, override the final limit with that value, otherwise use the calculated finalLimit
               const newLimit = args[0] ? parseInt(args[0]) : finalLimit;
               console.log(`User ${user.id} - Updating limit from ${user.limit} to ${newLimit}`);
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
