//═══════════════════════════════════════════════════════//
//                     SPONG BOT
//              WhatsApp Multi Device Bot
//═══════════════════════════════════════════════════════//

require('./settings')

const {
  default: NexusNwIncConnect,
  useSingleFileAuthState,
  DisconnectReason,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto
} = require('@adiwajshing/baileys')

const { state, saveState } = useSingleFileAuthState(`./${sessionName}.json`)
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const yargs = require('yargs/yargs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const PhoneNumber = require('awesome-phonenumber')

const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid
} = require('./lib/exif')

const {
  smsg,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetchJson,
  sleep
} = require('./lib/myfunc')

let low

try {
  low = require('lowdb')
} catch (e) {
  low = require('./lib/lowdb')
}

const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')

global.api = (name, path = '/', query = {}, apikeyqueryname) => {
  return (
    (name in global.APIs ? global.APIs[name] : name) +
    path +
    (query || apikeyqueryname
      ? '?' +
        new URLSearchParams(
          Object.entries({
            ...query,
            ...(apikeyqueryname
              ? {
                  [apikeyqueryname]:
                    global.APIKeys[name in global.APIs ? global.APIs[name] : name]
                }
              : {})
          })
        )
      : '')
  )
}

const store = makeInMemoryStore({
  logger: pino().child({
    level: 'silent',
    stream: 'store'
  })
})

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.db = new Low(
  /https?:\/\//.test(opts['db'] || '')
    ? new cloudDBAdapter(opts['db'])
    : /mongodb/.test(opts['db'])
      ? new mongoDB(opts['db'])
      : new JSONFile('database/database.json')
)

global.db.data = {
  users: {},
  chats: {},
  database: {},
  game: {},
  settings: {},
  others: {},
  sticker: {},
  ...(global.db.data || {})
}

// Save database every 30 seconds
if (global.db) {
  setInterval(async () => {
    if (global.db.data) await global.db.write()
  }, 30 * 1000)
}

async function startSpongBot() {
  const GojoMdNx = NexusNwIncConnect({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Spong Bot', 'Safari', '1.0.0'],
    auth: state
  })

  store.bind(GojoMdNx.ev)

  console.log(chalk.greenBright('Spong Bot is waking up... القهوة وصلت للسيستم.'))

  //═══════════════════════════════════════════════════════//
  // Anti Call
  //═══════════════════════════════════════════════════════//

  GojoMdNx.ws.on('CB:call', async (json) => {
    try {
      const callerId = json.content[0].attrs['call-creator']

      if (json.content[0].tag === 'offer') {
        let contact = await GojoMdNx.sendContact(callerId, global.owner)

        await GojoMdNx.sendMessage(
          callerId,
          {
            text:
              'ممنوع الرن على البوت يا صاحبي.\n' +
              'ابعت رسالة وأنا أرد عليك، إنما مكالمات دي رفاهية مش عندنا.'
          },
          { quoted: contact }
        )

        await sleep(8000)
        await GojoMdNx.updateBlockStatus(callerId, 'block')
      }
    } catch (err) {
      console.log(chalk.red('Anti-call error:'), err)
    }
  })

  //═══════════════════════════════════════════════════════//
  // Message Handler
  //═══════════════════════════════════════════════════════//

  GojoMdNx.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      let mek = chatUpdate.messages[0]
      if (!mek.message) return

      mek.message =
        Object.keys(mek.message)[0] === 'ephemeralMessage'
          ? mek.message.ephemeralMessage.message
          : mek.message

      if (mek.key && mek.key.remoteJid === 'status@broadcast') return
      if (!GojoMdNx.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
      if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

      let m = smsg(GojoMdNx, mek, store)
      require('./Gojosensei')(GojoMdNx, m, chatUpdate, store)
    } catch (err) {
      console.log(chalk.red('Message handler error:'), err)
    }
  })

  //═══════════════════════════════════════════════════════//
  // Group Settings Update
  //═══════════════════════════════════════════════════════//

  GojoMdNx.ev.on('groups.update', async (pea) => {
    try {
      let ppgc

      try {
        ppgc = await GojoMdNx.profilePictureUrl(pea[0].id, 'image')
      } catch {
        ppgc = 'https://i.ibb.co/7pD7N8S/profile.png'
      }

      let groupImage = { url: ppgc }
      let text = ''

      if (pea[0].announce === true) {
        text =
          '╭───「 إعدادات الجروب 」\n' +
          '│ الجروب اتقفل.\n' +
          '│ المشرفين بس يقدروا يبعتوا دلوقتي.\n' +
          '╰────────────'
      } else if (pea[0].announce === false) {
        text =
          '╭───「 إعدادات الجروب 」\n' +
          '│ الجروب اتفتح.\n' +
          '│ الكل يقدر يشارك، بس بالعقل يا جماعة.\n' +
          '╰────────────'
      } else if (pea[0].restrict === true) {
        text =
          '╭───「 إعدادات الجروب 」\n' +
          '│ تعديل معلومات الجروب بقى للمشرفين بس.\n' +
          '│ النظام حلو برضه.\n' +
          '╰────────────'
      } else if (pea[0].restrict === false) {
        text =
          '╭───「 إعدادات الجروب 」\n' +
          '│ تعديل معلومات الجروب اتفتح للأعضاء.\n' +
          '│ ربنا يستر على الاسم والصورة.\n' +
          '╰────────────'
      } else if (pea[0].subject) {
        text =
          '╭───「 اسم جديد للجروب 」\n' +
          `│ الاسم الجديد: *${pea[0].subject}*\n` +
          '│ تغيير رسمي، ختم النسر مش موجود بس تمام.\n' +
          '╰────────────'
      }

      if (text) {
        GojoMdNx.send5ButImg(pea[0].id, text, global.footer, groupImage, [])
      }
    } catch (err) {
      console.log(chalk.red('Group update error:'), err)
    }
  })

  //═══════════════════════════════════════════════════════//
  // Welcome & Goodbye
  //═══════════════════════════════════════════════════════//

  GojoMdNx.ev.on('group-participants.update', async (anu) => {
    console.log(anu)

    try {
      let metadata = await GojoMdNx.groupMetadata(anu.id)
      let participants = anu.participants

      for (let num of participants) {
        let ppuser
        let ppgroup

        try {
          ppuser = await GojoMdNx.profilePictureUrl(num, 'image')
        } catch {
          ppuser = 'https://i.ibb.co/7pD7N8S/profile.png'
        }

        try {
          ppgroup = await GojoMdNx.profilePictureUrl(anu.id, 'image')
        } catch {
          ppgroup = 'https://i.ibb.co/7pD7N8S/profile.png'
        }

        let nama = await GojoMdNx.getName(num)
        let memb = metadata.participants.length
        let desc = metadata.desc || 'لا يوجد وصف للجروب.'

        let welcomeCaption =
          `╭───「 نورت الجروب 」\n` +
          `│ أهلاً @${num.split('@')[0]}\n` +
          `│ دخلت: ${metadata.subject}\n` +
          `│ عددنا بقى: ${memb}\n` +
          `│ الوصف: ${desc}\n` +
          `│ خد راحتك، بس بلاش دوشة مالهاش لازمة.\n` +
          `╰────────────`

        let goodbyeCaption =
          `╭───「 خرج من الجروب 」\n` +
          `│ @${num.split('@')[0]} مشي من ${metadata.subject}\n` +
          `│ الباب كان مفتوح، بس الكرامة قفلت وراه.\n` +
          `╰────────────`

        if (anu.action === 'add') {
          try {
            let welcomeImage = await getBuffer(
              `https://hardianto.xyz/api/welcome3?profile=${encodeURIComponent(ppuser)}&name=${encodeURIComponent(nama)}&bg=https://telegra.ph/file/8bbe8a7de5c351dfcb077.jpg&namegb=${encodeURIComponent(metadata.subject)}&member=${encodeURIComponent(memb)}`
            )

            await GojoMdNx.sendMessage(anu.id, {
              image: welcomeImage,
              contextInfo: { mentionedJid: [num] },
              caption: welcomeCaption
            })
          } catch {
            await GojoMdNx.sendMessage(anu.id, {
              text: welcomeCaption,
              contextInfo: { mentionedJid: [num] }
            })
          }
        } else if (anu.action === 'remove') {
          try {
            let goodbyeImage = await getBuffer(
              `https://hardianto.xyz/api/goodbye3?profile=${encodeURIComponent(ppuser)}&name=${encodeURIComponent(nama)}&bg=https://telegra.ph/file/8bbe8a7de5c351dfcb077.jpg&namegb=${encodeURIComponent(metadata.subject)}&member=${encodeURIComponent(memb)}`
            )

            await GojoMdNx.sendMessage(anu.id, {
              image: goodbyeImage,
              contextInfo: { mentionedJid: [num] },
              caption: goodbyeCaption
            })
          } catch {
            await GojoMdNx.sendMessage(anu.id, {
              text: goodbyeCaption,
              contextInfo: { mentionedJid: [num] }
            })
          }
        }
      }
    } catch (err) {
      console.log(chalk.red('Welcome/goodbye error:'), err)
    }
  })

  //═══════════════════════════════════════════════════════//
  // JID Decoder
  //═══════════════════════════════════════════════════════//

  GojoMdNx.decodeJid = (jid) => {
    if (!jid) return jid

    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
    }

    return jid
  }

  //═══════════════════════════════════════════════════════//
  // Contacts Update
  //═══════════════════════════════════════════════════════//

  GojoMdNx.ev.on('contacts.update', (update) => {
    for (let contact of update) {
      let id = GojoMdNx.decodeJid(contact.id)
      if (store && store.contacts) {
        store.contacts[id] = {
          id,
          name: contact.notify
        }
      }
    }
  })

  //═══════════════════════════════════════════════════════//
  // Get Name
  //═══════════════════════════════════════════════════════//

  GojoMdNx.getName = (jid, withoutContact = false) => {
    let id = GojoMdNx.decodeJid(jid)
    withoutContact = GojoMdNx.withoutContact || withoutContact

    let v

    if (id.endsWith('@g.us')) {
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {}

        if (!(v.name || v.subject)) {
          v = (await GojoMdNx.groupMetadata(id)) || {}
        }

        resolve(
          v.name ||
            v.subject ||
            PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')
        )
      })
    } else {
      v =
        id === '0@s.whatsapp.net'
          ? { id, name: 'WhatsApp' }
          : id === GojoMdNx.decodeJid(GojoMdNx.user.id)
            ? GojoMdNx.user
            : store.contacts[id] || {}

      return (
        (withoutContact ? '' : v.name) ||
        v.subject ||
        v.verifiedName ||
        PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
      )
    }
  }

  //═══════════════════════════════════════════════════════//
  // Send Contact
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendContact = async (jid, kon, quoted = '', opts = {}) => {
    let list = []

    for (let i of kon) {
      list.push({
        displayName: await GojoMdNx.getName(i + '@s.whatsapp.net'),
        vcard:
          'BEGIN:VCARD\n' +
          'VERSION:3.0\n' +
          `N:${ownername}\n` +
          `FN:${ownername}\n` +
          `item1.TEL;waid=${i}:${i}\n` +
          'item1.X-ABLabel:Click To Chat\n' +
          `item2.EMAIL;type=INTERNET:${sc}\n` +
          'item2.X-ABLabel:Contact\n' +
          `item3.URL:${myweb}\n` +
          'item3.X-ABLabel:Website\n' +
          `item4.ADR:;;${region};;;;\n` +
          'item4.X-ABLabel:Region\n' +
          'END:VCARD'
      })
    }

    return GojoMdNx.sendMessage(
      jid,
      {
        contacts: {
          displayName: `${list.length} Contact`,
          contacts: list
        },
        ...opts
      },
      { quoted }
    )
  }

  //═══════════════════════════════════════════════════════//
  // Set Status
  //═══════════════════════════════════════════════════════//

  GojoMdNx.setStatus = (status) => {
    GojoMdNx.query({
      tag: 'iq',
      attrs: {
        to: '@s.whatsapp.net',
        type: 'set',
        xmlns: 'status'
      },
      content: [
        {
          tag: 'status',
          attrs: {},
          content: Buffer.from(status, 'utf-8')
        }
      ]
    })

    return status
  }

  GojoMdNx.public = true
  GojoMdNx.serializeM = (m) => smsg(GojoMdNx, m, store)

  //═══════════════════════════════════════════════════════//
  // Connection Update
  //═══════════════════════════════════════════════════════//

  GojoMdNx.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.greenBright('Spong Bot connected. الدنيا اشتغلت يا باشا.'))
    }

    if (connection === 'close') {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode

      if (reason === DisconnectReason.badSession) {
        console.log('Bad session file. Delete session.json and scan again.')
        GojoMdNx.logout()
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log('Connection closed, reconnecting...')
        startSpongBot()
      } else if (reason === DisconnectReason.connectionLost) {
        console.log('Connection lost from server, reconnecting...')
        startSpongBot()
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log('Connection replaced. Another session opened.')
        GojoMdNx.logout()
      } else if (reason === DisconnectReason.loggedOut) {
        console.log('Device logged out. Scan again and run.')
        GojoMdNx.logout()
      } else if (reason === DisconnectReason.restartRequired) {
        console.log('Restart required, restarting...')
        startSpongBot()
      } else if (reason === DisconnectReason.timedOut) {
        console.log('Connection timed out, reconnecting...')
        startSpongBot()
      } else {
        GojoMdNx.end(`Unknown DisconnectReason: ${reason}|${connection}`)
      }
    }
  })

  GojoMdNx.ev.on('creds.update', saveState)

  //═══════════════════════════════════════════════════════//
  // Helper: Send 5 Button Image
  //═══════════════════════════════════════════════════════//

  GojoMdNx.send5ButImg = async (jid, text = '', footer = '', img, but = [], options = {}) => {
    let message = await prepareWAMessageMedia(
      { image: img },
      { upload: GojoMdNx.waUploadToServer }
    )

    let template = generateWAMessageFromContent(
      jid,
      proto.Message.fromObject({
        templateMessage: {
          hydratedTemplate: {
            imageMessage: message.imageMessage,
            hydratedContentText: text,
            hydratedFooterText: footer,
            hydratedButtons: but
          }
        }
      }),
      options
    )

    return GojoMdNx.relayMessage(jid, template.message, {
      messageId: template.key.id
    })
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Send Button Text
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
    let buttonMessage = {
      text,
      footer,
      buttons,
      headerType: 2,
      ...options
    }

    return GojoMdNx.sendMessage(jid, buttonMessage, {
      quoted,
      ...options
    })
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Send Text
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendText = (jid, text, quoted = '', options) => {
    return GojoMdNx.sendMessage(
      jid,
      {
        text,
        ...options
      },
      { quoted }
    )
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Send Image
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendImage = async (jid, imagePath, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(imagePath)
      ? imagePath
      : /^data:.*?\/.*?;base64,/i.test(imagePath)
        ? Buffer.from(imagePath.split`,`[1], 'base64')
        : /^https?:\/\//.test(imagePath)
          ? await getBuffer(imagePath)
          : fs.existsSync(imagePath)
            ? fs.readFileSync(imagePath)
            : Buffer.alloc(0)

    return GojoMdNx.sendMessage(
      jid,
      {
        image: buffer,
        caption,
        ...options
      },
      { quoted }
    )
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Send Video
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendVideo = async (jid, videoPath, caption = '', quoted = '', gif = false, options) => {
    let buffer = Buffer.isBuffer(videoPath)
      ? videoPath
      : /^data:.*?\/.*?;base64,/i.test(videoPath)
        ? Buffer.from(videoPath.split`,`[1], 'base64')
        : /^https?:\/\//.test(videoPath)
          ? await getBuffer(videoPath)
          : fs.existsSync(videoPath)
            ? fs.readFileSync(videoPath)
            : Buffer.alloc(0)

    return GojoMdNx.sendMessage(
      jid,
      {
        video: buffer,
        caption,
        gifPlayback: gif,
        ...options
      },
      { quoted }
    )
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Send Audio
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendAudio = async (jid, audioPath, quoted = '', ptt = false, options) => {
    let buffer = Buffer.isBuffer(audioPath)
      ? audioPath
      : /^data:.*?\/.*?;base64,/i.test(audioPath)
        ? Buffer.from(audioPath.split`,`[1], 'base64')
        : /^https?:\/\//.test(audioPath)
          ? await getBuffer(audioPath)
          : fs.existsSync(audioPath)
            ? fs.readFileSync(audioPath)
            : Buffer.alloc(0)

    return GojoMdNx.sendMessage(
      jid,
      {
        audio: buffer,
        ptt,
        ...options
      },
      { quoted }
    )
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Send Text With Mentions
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendTextWithMentions = async (jid, text, quoted, options = {}) => {
    return GojoMdNx.sendMessage(
      jid,
      {
        text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
            (v) => v[1] + '@s.whatsapp.net'
          )
        },
        ...options
      },
      { quoted }
    )
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Image Sticker
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendImageAsSticker = async (jid, imagePath, quoted, options = {}) => {
    let buff = Buffer.isBuffer(imagePath)
      ? imagePath
      : /^data:.*?\/.*?;base64,/i.test(imagePath)
        ? Buffer.from(imagePath.split`,`[1], 'base64')
        : /^https?:\/\//.test(imagePath)
          ? await getBuffer(imagePath)
          : fs.existsSync(imagePath)
            ? fs.readFileSync(imagePath)
            : Buffer.alloc(0)

    let buffer

    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options)
    } else {
      buffer = await imageToWebp(buff)
    }

    await GojoMdNx.sendMessage(
      jid,
      {
        sticker: { url: buffer },
        ...options
      },
      { quoted }
    )

    return buffer
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Video Sticker
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendVideoAsSticker = async (jid, videoPath, quoted, options = {}) => {
    let buff = Buffer.isBuffer(videoPath)
      ? videoPath
      : /^data:.*?\/.*?;base64,/i.test(videoPath)
        ? Buffer.from(videoPath.split`,`[1], 'base64')
        : /^https?:\/\//.test(videoPath)
          ? await getBuffer(videoPath)
          : fs.existsSync(videoPath)
            ? fs.readFileSync(videoPath)
            : Buffer.alloc(0)

    let buffer

    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options)
    } else {
      buffer = await videoToWebp(buff)
    }

    await GojoMdNx.sendMessage(
      jid,
      {
        sticker: { url: buffer },
        ...options
      },
      { quoted }
    )

    return buffer
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Download And Save Media
  //═══════════════════════════════════════════════════════//

  GojoMdNx.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true
  ) => {
    let quoted = message.msg ? message.msg : message
    let mime = (message.msg || message).mimetype || ''
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]

    const stream = await downloadContentFromMessage(quoted, messageType)

    let buffer = Buffer.from([])

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    let type = await FileType.fromBuffer(buffer)
    let trueFileName = attachExtension ? filename + '.' + type.ext : filename

    await fs.writeFileSync(trueFileName, buffer)

    return trueFileName
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Download Media
  //═══════════════════════════════════════════════════════//

  GojoMdNx.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || ''
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]

    const stream = await downloadContentFromMessage(message, messageType)

    let buffer = Buffer.from([])

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    return buffer
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Send Media
  //═══════════════════════════════════════════════════════//

  GojoMdNx.sendMedia = async (
    jid,
    mediaPath,
    fileName = '',
    caption = '',
    quoted = '',
    options = {}
  ) => {
    let types = await GojoMdNx.getFile(mediaPath, true)
    let { mime, ext, res, data, filename } = types

    if ((res && res.status !== 200) || data.length <= 65536) {
      try {
        throw { json: JSON.parse(data.toString()) }
      } catch (e) {
        if (e.json) throw e.json
      }
    }

    let type = ''
    let mimetype = mime
    let pathFile = filename

    if (options.asDocument) type = 'document'

    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require('./lib/exif')
      let media = { mimetype: mime, data }

      pathFile = await writeExif(media, {
        packname: options.packname ? options.packname : global.packname,
        author: options.author ? options.author : global.author,
        categories: options.categories ? options.categories : []
      })

      await fs.promises.unlink(filename)

      type = 'sticker'
      mimetype = 'image/webp'
    } else if (/image/.test(mime)) {
      type = 'image'
    } else if (/video/.test(mime)) {
      type = 'video'
    } else if (/audio/.test(mime)) {
      type = 'audio'
    } else {
      type = 'document'
    }

    await GojoMdNx.sendMessage(
      jid,
      {
        [type]: { url: pathFile },
        caption,
        mimetype,
        fileName,
        ...options
      },
      {
        quoted,
        ...options
      }
    )

    return fs.promises.unlink(pathFile)
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Copy And Forward
  //═══════════════════════════════════════════════════════//

  GojoMdNx.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype

    if (options.readViewOnce) {
      message.message =
        message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message
          ? message.message.ephemeralMessage.message
          : message.message || undefined

      vtype = Object.keys(message.message.viewOnceMessage.message)[0]

      delete (
        message.message &&
        message.message.ignore
          ? message.message.ignore
          : message.message || undefined
      )

      delete message.message.viewOnceMessage.message[vtype].viewOnce

      message.message = {
        ...message.message.viewOnceMessage.message
      }
    }

    let mtype = Object.keys(message.message)[0]
    let content = await generateForwardMessageContent(message, forceForward)
    let ctype = Object.keys(content)[0]
    let context = {}

    if (mtype !== 'conversation') {
      context = message.message[mtype].contextInfo
    }

    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo
    }

    const waMessage = await generateWAMessageFromContent(
      jid,
      content,
      options
        ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo
              ? {
                  contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                  }
                }
              : {})
          }
        : {}
    )

    await GojoMdNx.relayMessage(jid, waMessage.message, {
      messageId: waMessage.key.id
    })

    return waMessage
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Modify Message
  //═══════════════════════════════════════════════════════//

  GojoMdNx.cMod = (jid, copy, text = '', sender = GojoMdNx.user.id, options = {}) => {
    let mtype = Object.keys(copy.message)[0]
    let isEphemeral = mtype === 'ephemeralMessage'

    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
    }

    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
    let content = msg[mtype]

    if (typeof content === 'string') {
      msg[mtype] = text || content
    } else if (content.caption) {
      content.caption = text || content.caption
    } else if (content.text) {
      content.text = text || content.text
    }

    if (typeof content !== 'string') {
      msg[mtype] = {
        ...content,
        ...options
      }
    }

    if (copy.key.participant) {
      sender = copy.key.participant = sender || copy.key.participant
    } else if (copy.key.participant) {
      sender = copy.key.participant = sender || copy.key.participant
    }

    if (copy.key.remoteJid.includes('@s.whatsapp.net')) {
      sender = sender || copy.key.remoteJid
    } else if (copy.key.remoteJid.includes('@broadcast')) {
      sender = sender || copy.key.remoteJid
    }

    copy.key.remoteJid = jid
    copy.key.fromMe = sender === GojoMdNx.user.id

    return proto.WebMessageInfo.fromObject(copy)
  }

  //═══════════════════════════════════════════════════════//
  // Helper: Get File
  //═══════════════════════════════════════════════════════//

  GojoMdNx.getFile = async (PATH, save) => {
    let res
    let filename

    let data = Buffer.isBuffer(PATH)
      ? PATH
      : /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split`,`[1], 'base64')
        : /^https?:\/\//.test(PATH)
          ? await (res = await getBuffer(PATH))
          : fs.existsSync(PATH)
            ? ((filename = PATH), fs.readFileSync(PATH))
            : typeof PATH === 'string'
              ? PATH
              : Buffer.alloc(0)

    let type =
      (await FileType.fromBuffer(data)) || {
        mime: 'application/octet-stream',
        ext: 'bin'
      }

    filename = path.join(__dirname, './src/' + new Date() * 1 + '.' + type.ext)

    if (data && save) {
      await fs.promises.writeFile(filename, data)
    }

    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data
    }
  }

  return GojoMdNx
}

startSpongBot()

let file = require.resolve(__filename)

fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Updated ${__filename}`))
  delete require.cache[file]
  require(file)
})
