exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
      try {
         // Use the base limit from env
         const baseLimitFromEnv = env.limit; // This uses the value from the env file

         // Process each user in the database (no filtering based on limit or premium status)
         global.db.users.forEach(user => {
            // Start with the base limit from env
            let finalLimit = baseLimitFromEnv;

            // Add points based on the user's referral count (10 points per referral)
            finalLimit += (user.referralCount || 0) * 10;

            // Add bonus if the user has not used a referral code
            if (user.referralCodeUsed === false) {
               finalLimit += 5; // Add bonus for not using a referral code
            }

            // Now check if the user's limit is less than the total limit (base + referral limit + bonus)
            if (user.limit < finalLimit) {
               // Final limit (override if custom amount passed as argument)
               user.limit = args[0] ? parseInt(args[0]) : finalLimit;
            }
         });

         // Update the last reset timestamp
         setting.lastReset = new Date().getTime();

         // Notify success
         client.reply(
            m.chat,
            Func.texted('bold', `🚩 Successfully reset limits for all users and adjusted referral-related points.`),
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
