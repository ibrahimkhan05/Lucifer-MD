const { Function: Func, NeoxrApi } = new(require('@neoxr/wb'))
global.Api = new NeoxrApi(process.env.API_ENDPOINT, process.env.API_KEY)
global.header = `© Lucifer-md v${require('package.json').version} (Beta)`
global.footer = ` Fastest Whatsapp bot by ibrahim ッ`
global.status = Object.freeze({
   invalid: Func.Styles('Invalid url'),
   wrong: Func.Styles('Wrong format.'),
   fail: Func.Styles('Can\'t get metadata'),
   error: Func.Styles('Error occurred'),
   errorF: Func.Styles('Sorry this feature is in error.'),
   premium: Func.Styles('This feature only for premium user.'),
   auth: Func.Styles('You do not have permission to use this feature, ask the owner first.'),
   owner: Func.Styles('This command only for owner.'),
   group: Func.Styles('This command will only work in groups.'),
   botAdmin: Func.Styles('This command will work when I become an admin.'),
   admin: Func.Styles('This command only for group admin.'),
   private: Func.Styles('Use this command in private chat.'),
   gameSystem: Func.Styles('Game features have been disabled.'),
   gameInGroup: Func.Styles('Game features have not been activated for this group.'),
   gameLevel: Func.Styles('You cannot play the game because your level has reached the maximum limit.')

})
global.bing = '1QQnqnxJmprWN5yKTLRWAofoy8ceWukLU5Y08b0UiXS5f2-nH-PoXOFxH_EXNi7_aqft77QV3yZElszWoePdkAe7uggtZADO4IknAmMbfgWFOcF_oUpYr-Ty20rIu5gu8F-Ro_nMzYkC77YJDSbcLPbEgKA057fD_yURgDsXcuc7Om23hj1wL-0eHJCool8zQobQRuhgJLoENgP6qwxuH9nidX6OEdZ7cUKaImPXD32A'
global.betabotz = ''
