exports.run = {
    usage: ['referral'],
    hidden: ['gencode'],
    use: 'Generates a referral code for the user.',
    category: 'referral',
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
          let redeemLink;
          const isNumber = x => typeof x === 'number' && !isNaN(x);
          
          // Check if the user already has a referral code
          let user = global.db.users.find(v => v.jid === m.sender);
          
          if (user) {
             if (!user.referralCode) {
                // Generate a new referral code if not present
                user.referralCode = Math.random().toString(36).substring(2, 8); // Generates a 6-char referral code
                global.db.users = global.db.users.map(v => v.jid === user.jid ? user : v);
                
                // Create a redeem link for the referral code with %20 for space encoding
                redeemLink = `https://api.whatsapp.com/send?phone=447375237255&text=/redeem%20${user.referralCode}`;
                
                // Send a stylish message with emojis
                client.reply(m.chat, `🎉 **Welcome to Lucifer BOT Referral System!** 🎉\n\n🔑 **Your Referral Code**: ${user.referralCode}\n💎 **Earn an Extra 10 Limit** for every successful referral! 💰\n\n📝 **Redeem your code here**: [Click to Redeem](${redeemLink})\n\n💬 **Share it with your friends and start earning extra limit!** 💥`, m);
             } else {
                // If the user already has a referral code, show it
                redeemLink = `https://api.whatsapp.com/send?phone=447375237255&text=/redeem%20${user.referralCode}`;
                client.reply(m.chat, `🔄 **You already have a Referral Code!**\n\n🔑 **Your Referral Code**: ${user.referralCode}\n💎 **Earn an Extra 10 Limit** for every successful referral! 💰\n\n📝 **Redeem your code here**: [Click to Redeem](${redeemLink})\n\n💬 **Share it with your friends and start earning extra limit!** 💥`, m);
             }
          } else {
             client.reply(m.chat, '🚫 **User not found. Please try again later.** 🚫', m);
          }
       } catch (e) {
          console.log(e);
          client.reply(m.chat, Func.jsonFormat(e), m);
       }
    },
    error: false,
    limit: true,
    restrict: true,
    cache: true,
    location: __filename
 }
 