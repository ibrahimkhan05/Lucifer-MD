exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
      try {
         // Process each user in the database
         global.db.users.filter(v => v.limit < env.limit && !v.premium).forEach(user => {
            // Calculate base limit from referrals
            let baseLimit = (user.referralCount || 0) * 10;

            // Add bonus if user used a referral code
            if (user.referralCodeUsed === false) {
               baseLimit += 5;
            }

            // Final limit (override if custom amount passed as argument)
            user.limit = args[0] ? parseInt(args[0]) : baseLimit;
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
