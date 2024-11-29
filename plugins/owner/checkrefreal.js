exports.run = {
    usage: ['totalreferral'],
    hidden: [''],
    use: '',
    category: 'owner',
    owner: true,  // Ensures that only the owner can use this command
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
            // Get all users who have referral codes
            const usersWithReferrals = global.db.users.filter(user => user.referralCode);

            if (usersWithReferrals.length === 0) {
                return client.reply(m.chat, '❌ *No users with referral codes found.* ❌', m);
            }

            // Create a message that will contain all the referral data
            let referralSummaryMessage = '';

            // Loop through each user with a referral code and gather the referral details
            for (let user of usersWithReferrals) {
                const referredUsers = user.referredUsers || [];
                let totalLimitEarned = 0;

                // Loop through referred users to calculate the limit earned
                for (let referred of referredUsers) {
                    const referredUser = global.db.users.find(v => v.jid === referred);
                    if (referredUser) {
                        // Referred user gets 5 points
                        totalLimitEarned += 5;
                    }
                }

                // Referrer earns 10 points for each user they referred
                const referralLimitFromReferredUsers = referredUsers.length * 10;

                // Sum of both total limit earned and referral limit from referring others
                totalLimitEarned += referralLimitFromReferredUsers;

                const formattedJid = `+${user.jid.replace('@s.whatsapp.net', '')}`;  // Format JID

                // Append referrer details to the summary message
                referralSummaryMessage += `👤 *Referrer*: ${user.name || 'Unknown'}\n📞 *Referrer Number*: ${formattedJid}\n🏆 *Total Limit Earned*: ${totalLimitEarned}\n\n*Referred Users*:\n`;

                // Loop through referred users to add their details
                for (let referred of referredUsers) {
                    const referredUser = global.db.users.find(v => v.jid === referred);
                    if (referredUser) {
                        const referredName = referredUser.name || 'Unknown';
                        const referredFormattedJid = `+${referredUser.jid.replace('@s.whatsapp.net', '')}`;  // Format JID for referred users
                        referralSummaryMessage += `👥 *Referred User*: ${referredName}\n📞 *Referred Number*: ${referredFormattedJid}\n🏆 *Limit Earned*: 5\n\n`; // Referred user gets 5 limit
                    }
                }
                referralSummaryMessage += '\n';
            }

            // Send the referral summary in one message
            client.reply(m.chat, referralSummaryMessage || 'No referral details to show.', m);

            // Notify the owner that the process is complete
            client.reply(m.chat, '📊 *Referral Summary Sent to Owner!* 📊', m);

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
