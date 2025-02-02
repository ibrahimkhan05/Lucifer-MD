const models = {
   users: Object.freeze({
      afk: -1,
      afkReason: '',
      afkObj: {},
      banned: false,
      ban_temporary: 0,
      ban_times: 0,
      premium: false,
      expired: 0,
      lastseen: 0,
      hit: 0,
      warning: 0,
      example: []
   }),
   groups: Object.freeze({
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
   }),
   chats: Object.freeze({
      chat: 0,
      lastchat: 0,
      lastseen: 0
   }),
   setting: Object.freeze({
      autodownload: true,
      antispam: true,
      debug: false,
      error: [],
      hidden: [],
      pluginDisable: [],
      receiver: [],
      groupmode: false,
      sk_pack: 'Sticker by',
      sk_author: '© neoxr.js',
      self: false,
      noprefix: false,
      multiprefix: false,
      prefix: ['/'],
      toxic: ["aassw"],
      online: true,
      onlyprefix: '+',
      owners: ['923229931076'],
      lastReset: new Date * 1,
      msg: 'Hi +tag 🪸\nI am an automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.\n\n◦ *Database* : +db\n◦ *Library* : Baileys v+version\n◦ *Website* : https://lucifercloud.me\n\nIf you find an error or want to upgrade premium plan contact the owner.',
      style: 4,
      cover: 'https://i.pinimg.com/564x/10/02/e7/1002e7219ab71b6b257bc15ca3229ec8.jpg',
      link: ''
   })
}

module.exports = { models }
