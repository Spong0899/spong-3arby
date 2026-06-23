//═══════════════════════════════════════════════════════//
//                    SPONG BOT SETTINGS
//              WhatsApp Multi Device Bot
//═══════════════════════════════════════════════════════//

const fs = require('fs')
const chalk = require('chalk')

//═══════════════════════════════════════════════════════//
// API SETTINGS
//═══════════════════════════════════════════════════════//

global.APIs = {
  zenz: 'https://zenzapis.xyz'
}

// حط API key في Replit Secrets باسم ZENZ_API_KEY لو عندك
global.APIKeys = {
  'https://zenzapis.xyz': process.env.ZENZ_API_KEY || ''
}

//═══════════════════════════════════════════════════════//
// OWNER SETTINGS
//═══════════════════════════════════════════════════════//

global.owner = ['201009520439']
global.premium = ['201009520439']
global.ownernomer = '201009520439'

global.ownername = 'Spong0899'
global.botname = 'Spong Bot'
global.footer = 'Spong Bot | شغال يا باشا متقلقش'

global.ig = 'https://github.com/Spong0899'
global.region = 'Egypt'
global.sc = 'https://wa.me/201009520439'
global.myweb = 'https://wa.me/201009520439'

global.packname = 'Spong Bot'
global.author = 'Made by Spong0899'

global.sessionName = process.env.SESSION_NAME || 'session'

// Prefixes
global.prefa = ['', '!', '.', '#', '/']
global.sp = '⭔'

//═══════════════════════════════════════════════════════//
// BOT MESSAGES
//═══════════════════════════════════════════════════════//

global.mess = {
  success: 'تمام يا نجم، اتعملت ✓',
  admin: '*الأمر ده للمشرفين بس يا كبير.*',
  botAdmin: '*اديني إشراف الأول، وأنا أظبط الدنيا.*',
  owner: '*الأمر ده للمالك بس، متحاولش تفتح درج مش بتاعك.*',
  group: '*الأمر ده بيشتغل في الجروبات بس.*',
  private: '*الأمر ده للخاص بس، الجروب ملوش دعوة.*',
  bot: '*الأمر ده خاص بالبوت بس.*',
  wait: '*ثواني بس... Spong Bot بيطبخ الطلب على نار هادية.*',
  error: '*حصل خطأ صغير، السيستم عطس. جرّب تاني.*',
  endLimit: '*خلصت حدودك اليومية يا معلم، نرجع بكرة بدماغ صافية.*'
}

//═══════════════════════════════════════════════════════//
// USER LIMITS
//═══════════════════════════════════════════════════════//

global.limitawal = {
  premium: 'Infinity',
  free: 12,
  monayawal: 1000
}

//═══════════════════════════════════════════════════════//
// RPG DEFAULT DATA
//═══════════════════════════════════════════════════════//

global.rpg = {
  darahawal: 100,
  besiawal: 15,
  goldawal: 10,
  emeraldawal: 5,
  umpanawal: 5,
  potionawal: 1
}

//═══════════════════════════════════════════════════════//
// MEDIA
//═══════════════════════════════════════════════════════//

const thumbPath = './GojoMedia/gojo.jpg'

global.thumb = fs.existsSync(thumbPath)
  ? fs.readFileSync(thumbPath)
  : Buffer.from('')

global.flaming = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text='
global.fluming = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=fluffy-logo&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text='
global.flarun = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=runner-logo&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text='
global.flasmurf = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=smurfs-logo&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text='

//═══════════════════════════════════════════════════════//
// AUTO RELOAD SETTINGS FILE
//═══════════════════════════════════════════════════════//

let file = require.resolve(__filename)

fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Updated ${__filename}`))
  delete require.cache[file]
  require(file)
})
