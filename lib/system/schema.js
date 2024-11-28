module.exports = (m, env) => {
   // Helper function to check if a value is a valid number
   const isNumber = x => typeof x === 'number' && !isNaN(x);
   
   // Ensure user exists in the database and initialize missing properties
   let user = global.db.users.find(v => v.jid === m.sender);
   if (user) {
      // Initialize missing user properties
      if (!isNumber(user.afk)) user.afk = -1;
      if (!('afkReason' in user)) user.afkReason = '';
      if (!('afkObj' in user)) user.afkObj = {};
      if (!('name' in user)) user.name = m.pushName;
      if (!('banned' in user)) user.banned = false;
      if (!('referralCode' in user)) user.referralCode = '';  // Referral code
      if (!('referralCount' in user)) user.referralCount = 0;  // Times referral code has been used
      if (!('referralCodeUsed' in user)) user.referralCodeUsed = false;  // Whether referral code has been used
      if (!('referredBy' in user)) user.referredBy = '';  // Who referred this user
      if (!('referredUsers' in user)) user.referredUsers = [];  // Users who joined via this referral code
      if (!isNumber(user.points)) user.points = 0;  // User's points
      if (!isNumber(user.ban_temporary)) user.ban_temporary = 0;
      if (!isNumber(user.ban_times)) user.ban_times = 0;
      if (!isNumber(user.limit)) user.limit = env.limit;
      if (!('premium' in user)) user.premium = false;
      if (!isNumber(user.expired)) user.expired = 0;
      if (!isNumber(user.lastseen)) user.lastseen = 0;
      if (!isNumber(user.hit)) user.hit = 0;
      if (!isNumber(user.warning)) user.warning = 0;
   } else {
      // Initialize user in the database if not found
      global.db.users.push({
         jid: m.sender,
         afk: -1,
         afkReason: '',
         afkObj: {},
         name: m.pushName,
         banned: false,
         ban_temporary: 0,
         ban_times: 0,
         limit: env.limit,
         premium: false,
         expired: 0,
         lastseen: 0,
         hit: 0,
         warning: 0,
         referralCode: '',
         referralCount: 0,
         referralCodeUsed: false,
         referredBy: '',
         referredUsers: [],
         points: 0
      });
   }

   // Handle group-specific database operations
   if (m.isGroup) {
      let group = global.db.groups.find(v => v.jid === m.chat);
      if (group) {
         // Initialize missing group properties
         if (!isNumber(group.activity)) group.activity = 0;
         if (!('antidelete' in group)) group.antidelete = true;
         if (!('antilink' in group)) group.antilink = true;
         if (!('antivirtex' in group)) group.antivirtex = true;
         if (!('filter' in group)) group.filter = false;
         if (!('left' in group)) group.left = false;
         if (!('localonly' in group)) group.localonly = false;
         if (!('mute' in group)) group.mute = false;
         if (!('viewonce' in group)) group.viewonce = true;
         if (!('autosticker' in group)) group.autosticker = true;
         if (!('member' in group)) group.member = {};
         if (!('text_left' in group)) group.text_left = '';
         if (!('text_welcome' in group)) group.text_welcome = '';
         if (!('welcome' in group)) group.welcome = true;
         if (!isNumber(group.expired)) group.expired = 0;
         if (!('stay' in group)) group.stay = false;
      } else {
         // Initialize group if not found
         global.db.groups.push({
            jid: m.chat,
            activity: 0,
            antidelete: true,
            antilink: false,
            antivirtex: false,
            filter: false,
            left: false,
            localonly: false,
            mute: false,
            viewonce: true,
            autosticker: true,
            member: {},
            text_left: '',
            text_welcome: '',
            welcome: true,
            expired: 0,
            stay: false
         });
      }
   }

   // Handle chat-specific database operations
   let chat = global.db.chats.find(v => v.jid === m.chat);
   if (chat) {
      // Initialize missing chat properties
      if (!isNumber(chat.chat)) chat.chat = 0;
      if (!isNumber(chat.lastchat)) chat.lastchat = 0;
      if (!isNumber(chat.lastseen)) chat.lastseen = 0;
   } else {
      // Initialize chat if not found
      global.db.chats.push({
         jid: m.chat,
         chat: 0,
         lastchat: 0,
         lastseen: 0
      });
   }

   // Handle global settings
   let setting = global.db.setting;
   if (setting) {
      // Initialize missing settings
      if (!('autodownload' in setting)) setting.autodownload = true;
      if (!('antispam' in setting)) setting.antispam = false;
      if (!('chatbot' in setting)) setting.chatbot = false;
      if (!('debug' in setting)) setting.debug = false;
      if (!('error' in setting)) setting.error = [];
      if (!('hidden' in setting)) setting.hidden = [];
      if (!('pluginDisable' in setting)) setting.pluginDisable = [];
      if (!('receiver' in setting)) setting.receiver = [];
      if (!('groupmode' in setting)) setting.groupmode = false;
      if (!('sk_pack' in setting)) setting.sk_pack = 'Ibrahim';
      if (!('sk_author' in setting)) setting.sk_author = '© Lucifer-md';
      if (!('self' in setting)) setting.self = false;
      if (!('noprefix' in setting)) setting.noprefix = false;
      if (!('multiprefix' in setting)) setting.multiprefix = true;
      if (!('prefix' in setting)) setting.prefix = ['/'];
      if (!('toxic' in setting)) setting.toxic = ["aassw"];
      if (!('online' in setting)) setting.online = true;
      if (!('onlyprefix' in setting)) setting.onlyprefix = '+';
      if (!('owners' in setting)) setting.owners = ['923229931076'];
      if (!isNumber(setting.lastReset)) setting.lastReset = new Date * 1;
      if (!('msg' in setting)) setting.msg = 'Hi +tag 🪸\nI am an automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n◦ *Database* : +db\n◦ *Library* : Baileys v+version\n◦ *Website* : https://lucifercloud.me\n\nIf you find an error or want to upgrade premium plan contact the owner.';
      if (!isNumber(setting.style)) setting.style = 4;
      if (!('cover' in setting)) setting.cover = 'https://i.pinimg.com/564x/10/02/e7/1002e7219ab71b6b257bc15ca3229ec8.jpg';
      if (!('link' in setting)) setting.link = '';
      if (!('verify' in setting)) setting.verify = false;
   } else {
      // Initialize settings if not found
      global.db.setting = {
         autodownload: true,
         antispam: true,
         debug: false,
         error: [],
         hidden: [],
         pluginDisable: [],
         groupmode: false,
         sk_pack: 'Ibrahim',
         sk_author: '© Lucifer-md',
         self: false,
         noprefix: false,
         multiprefix: true,
         receiver: [],
         prefix: ['/'],
         toxic: ["aassw"],
         online: true,
         verify: false,
         onlyprefix: '+',
         owners: ['923229931076'],
         lastReset: new Date * 1,
         msg: 'Hi +tag 🪸\nI am an automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n◦ *Database* : +db\n◦ *Library* : Baileys v+version\n◦ *Website* : https://lucifercloud.me\n\nIf you find an error or want to upgrade premium plan contact the owner.',
         style: 4,
         cover: 'https://i.pinimg.com/564x/10/02/e7/1002e7219ab71b6b257bc15ca3229ec8.jpg',
         link: ''
      };
   }
}
