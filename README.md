<p align="center">
  <img src="https://telegra.ph/file/d97881d3cfbd65faa278f.jpg" alt="Spong Bot" width="350"/>
</p>

<h1 align="center">🧽 Spong Bot</h1>

<p align="center">
  WhatsApp Multi Device Bot using Baileys
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Bot-Spong%20Bot-25D366?style=for-the-badge&logo=whatsapp&logoColor=white"/>
  <img src="https://img.shields.io/badge/Platform-Replit-orange?style=for-the-badge&logo=replit&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-Required-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
</p>

---

## 📌 About

**Spong Bot** is a WhatsApp Multi Device bot built with **Node.js** and **Baileys**.

The bot supports commands, media tools, downloader features, owner controls, database storage, stickers, group tools, and more.

---

## 👑 Owner

```txt
Owner: Spong0899
Bot Name: Spong Bot
WhatsApp: 01009520439
```

<p align="center">
  <a href="https://wa.me/201009520439">
    <img src="https://img.shields.io/badge/Contact%20Spong%20Bot-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  </a>
</p>

Direct WhatsApp Link:

```txt
https://wa.me/201009520439
```

---

## ⚠️ Important Notes

Do not upload these files publicly:

```txt
session.json
.env
node_modules/
```

`session.json` contains your WhatsApp login session.

Anyone who gets it may control the bot session.

---

## ✅ Requirements

Before running the bot, you need:

```txt
Node.js
NPM
FFmpeg
Git
WhatsApp account
```

For Replit, Node.js and NPM are already available.

---

## 📁 Project Structure

```txt
spong-bot/
│
├── index.js
├── package.json
├── settings.js
├── README.md
├── .gitignore
├── .replit
│
├── src/
├── lib/
├── database/
├── storage/
└── GojoMedia/
```

---

## 🚀 Run on Replit

### 1. Create a new Replit project

Choose:

```txt
Node.js
```

### 2. Upload or import the bot files

Do not upload:

```txt
node_modules/
session.json
.env
```

### 3. Install packages

Open the Shell and run:

```bash
npm install
```

### 4. Start the bot

```bash
npm start
```

or:

```bash
node index.js
```

### 5. Scan QR Code

When the QR appears in the console, scan it using WhatsApp:

```txt
WhatsApp > Linked Devices > Link a Device
```

---

## ⚙️ Settings

Open `settings.js` and edit:

```js
global.owner = ["201009520439"]
global.ownername = "Spong0899"
global.botname = "Spong Bot"
global.packname = "Spong Bot"
global.author = "Spong0899"
```

---

## 📦 package.json

Use this clean version:

```json
{
  "name": "spong-bot",
  "version": "1.0.0",
  "description": "Spong Bot - WhatsApp Multi Device Bot",
  "main": "index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node index.js"
  },
  "keywords": [
    "whatsapp",
    "bot",
    "spong-bot",
    "baileys",
    "multi-device"
  ],
  "author": "Spong0899",
  "license": "MIT",
  "dependencies": {
    "@adiwajshing/baileys": "^4.0.1",
    "@adiwajshing/keyed-db": "^0.2.4",
    "awesome-phonenumber": "^2.64.0",
    "axios": "^0.24.0",
    "chalk": "^4.1.2",
    "cheerio": "^1.0.0-rc.10",
    "file-type": "^16.5.3",
    "fluent-ffmpeg": "^2.1.2",
    "got": "^11.8.3",
    "g-i-s": "^2.1.6",
    "google-it": "^1.6.2",
    "human-readable": "^0.2.1",
    "jimp": "^0.16.1",
    "jsdom": "^16.4.0",
    "lowdb": "^2.1.0",
    "moment-timezone": "^0.5.34",
    "mumaker": "^1.0.0",
    "node-cron": "^3.0.0",
    "node-fetch": "^2.6.1",
    "node-webpmux": "^3.1.0",
    "pino": "^7.0.5",
    "qrcode-terminal": "^0.12.0",
    "scrape-primbon": "^1.1.0",
    "yargs": "^17.2.1",
    "xfarr-api": "^1.0.2",
    "yt-search": "^2.10.2"
  },
  "directories": {
    "lib": "lib",
    "src": "src"
  }
}
```

---

## 🧼 .gitignore

Create a file named `.gitignore` and add:

```gitignore
node_modules/
session.json
.env
npm-debug.log
.DS_Store
```

---

## 🧩 .replit

Create a file named `.replit` and add:

```toml
run = "npm start"
```

---

## ✨ Features

|        Feature        | Status |
| :-------------------: | :----: |
| WhatsApp Multi Device |    ✅   |
|     Owner Commands    |    ✅   |
|      Media Tools      |    ✅   |
|       Downloader      |    ✅   |
|        Database       |    ✅   |
|      Search Tools     |    ✅   |
|        Stickers       |    ✅   |
|     Group Commands    |    ✅   |
|       Auto Reply      |    ✅   |
|      Replit Ready     |    ✅   |

---

## 🛠 Common Problems

### Bot does not start

Run:

```bash
npm install
npm start
```

### QR code does not appear

Delete old session files, then restart the bot.

### Replit stops the bot

Use an uptime monitor or keep the console active while testing.

### FFmpeg error

Make sure FFmpeg is installed or available in the Replit environment.

---

## 🙏 Credits

This bot is based on the original open-source project:

```txt
Gojo-Satoru by nexusNw
```

Original repository:

```txt
https://github.com/nexusNw/Gojo-Satoru
```

Thanks to:

```txt
@adiwajshing/baileys
Alien-Alfa
DGXeon
AflahXrd
nexusNw
```

---

## 📜 License

MIT License

---

<p align="center">
  Made for Spong Bot 🧽
</p>
