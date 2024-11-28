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
          const isNumber = x => typeof x === 'number' && !isNaN(x);
          // Check if the user already has a referral code
          let user = global.db.users.find(v => v.jid === m.sender);
          if (user) {
             if (!user.referralCode) {
                // Generate a new referral code if not present
                user.referralCode = Math.random().toString(36).substring(2, 8); // Generates a 6-char referral code
                global.db.users = global.db.users.map(v => v.jid === user.jid ? user : v);
                const redeemLink = `https://api.whatsapp.com/send?phone=${env.botNumber}&text=/redeem ${user.referralCode}`;
                client.reply(m.chat, `Your referral code is: ${user.referralCode}\nRedeem it here: ${redeemLink}`, m);
             } else {
                client.reply(m.chat, `Your referral code is already: {user.referralCode}\nRedeem it here: ${redeemLink}`, m);
             }
          } else {
             client.reply(m.chat, 'User not found, please try again later.', m);
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
 