exports.run = {
   usage: ['reset'],
   category: 'owner',
   async: async (m, { client, args, command, setting, env, Func }) => {
      try {
         global.db.users.forEach(user => {
            // Base limit from environment (env.limit) or other source
            let finalLimit = env.limit; 

            // Check if the user has used a referral code
            if (user.referralCodeUsed === true) {
               console.log(`User ${user.jid} has used a referral code, adding 5 points.`);
               finalLimit += 5; // Add 5 points for using a referral code
            }

            // Update the user's limit with the calculated final limit
            user.limit = args[0] ? parseInt(args[0]) : finalLimit;

            // Logging for verification
            console.log(`User ${user.jid} - Final Limit after adjustments: ${user.limit}`);
         });

         // Update the last reset timestamp
         setting.lastReset = new Date().getTime();

         // Notify success
         client.reply(
            m.chat,
            Func.texted('bold', `🚩 Successfully reset limits and added bonus points for users who used referral codes.`),
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
