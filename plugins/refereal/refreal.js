exports.run = {
    usage: ['referal'],
    hidden: ['rf'],
    use: 'referal',
    category: 'downloader',
    async: async (m, {
       client,
       args,
       text,
       isPrefix,
       command,
       env,
       Func
    }) => {
       try {
          const userJid = m.sender
          let user = global.db.users.find(u => u.jid === userJid)
          
          // If the user doesn't have a referral code, create one
          if (!user.referralCode) {
             const referralCode = generateReferralCode(userJid)
             user.referralCode = referralCode
             user.referralCount = 0  // Initial count is 0
             user.referredUsers = []  // To track which users used this referral code
 
             // Save the user data
             Func.saveDatabase(global.db)
          }
          
          // Send the referral link to the user
          const referralLink = `https://api.whatsapp.com/send?phone=${env.botNumber}&text=/redeem ${user.referralCode}`
          client.reply(m.chat, `Your referral link: ${referralLink}`, m)
       } catch (e) {
          console.log(e)
          client.reply(m.chat, Func.jsonFormat(e), m)
       }
    },
    error: false,
    limit: true,
    restrict: true,
    cache: true,
    location: __filename
 }
 
 function generateReferralCode(jid) {
    // Generate a simple referral code using user JID and timestamp
    return `${jid.slice(0, 5)}-${Date.now()}`
 }
 