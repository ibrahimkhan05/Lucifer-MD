exports.run = {
    usage: ['totalreferral'],
    hidden: [''],
    use: 'Shows a summary of the first user referred, their referrers, and points from referrals.',
    category: 'owner',
      // Ensures that only the owner can use this command
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
          // Get the first referred user
          const firstReferredUser = global.db.users.find(v => v.referredUsers && v.referredUsers.length > 0);
 
          if (!firstReferredUser) {
             return client.reply(m.chat, '❌ **No referred users found.** ❌', m);
          }
 
          // Loop through all referred users and send their details one by one
          for (let referrer of firstReferredUser.referredUsers) {
             const referrerUser = global.db.users.find(v => v.jid === referrer);
             if (referrerUser) {
                const referralPoints = referrerUser.referralPoints || 0; // Points system
 
                // Send message for each referrer and referred user
                await client.reply(m.chat, `👤 **Referrer**: ${referrerUser.name || 'Unknown'}\n📞 **Referrer JID**: ${referrerUser.jid}\n🏆 **Points Earned**: ${referralPoints}\n\n`, m);
             }
          }
 
          // Notify the owner that the process is complete
          client.reply(m.chat, '📊 **Referral Summary Sent to Owner!** 📊', m);
 
       } catch (e) {
          console.log(e);
          client.reply(m.chat, Func.jsonFormat(e), m);
       }
    },
    error: false,
    limit: true,
    restrict: true,
    cache: true,
    owner: true,
    location: __filename
 }
 