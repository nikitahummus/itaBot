const TelegramApi = require('node-telegram-bot-api');
require('dotenv').config()
const fetch = require('node-fetch');
const tgToken = process.env.TGTOKEN
const yaKey = process.env.YAKEY
const bot = new TelegramApi(tgToken, { polling: true })

const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');

bot.setMyCommands([{ command: '/start', description: 'Приветствие' },
{ command: '/info', description: 'что я делаю' }])

bot.on('message', async (msg) => {
  console.log(msg)
  const chatId = msg.chat.id
  const text = msg.text
  
  if (text === '/start') {
    if (msg.from.language_code === 'en'){
      await bot.sendMessage(chatId, 'O, да вы англичанин!')
    }
    if (msg.from.language_code === 'it'){
      await bot.sendMessage(chatId, 'Ciao! Molto piacere! Anche tu sei italiano?')
    }
    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/81c/b94/81cb94a5-6898-3351-8c34-216152f7c2ef/256/31.webp')
    await bot.sendMessage(chatId, `Привет, ${msg.from.first_name}! меня зовут Марко Пердусси), чтобы узнатб, что я могу делать, нажми /info`)
  }else if (text === '/info') {
    await bot.sendMessage(chatId, 'Я могу распознать голосовуху на русском языке и прислать тебе ее перевод на итальянском. Чтобы попробовать, просто запиши мне войс))0')
  } else if (text){
    bot.sendMessage(chatId, 'Я не настроен на восприятие текстовых сообщений')
  }
  if (msg.photo){
    bot.sendMessage(chatId, 'Красивое))0')
  }

  if (msg.voice) {
    const fileId = msg.voice?.file_id
    const fileObj = await bot.getFile(fileId)
    const path = fileObj.file_path
    const url = `https://api.telegram.org/file/bot${tgToken}/${path}`;
    const file = fs.createWriteStream(`./audio/bla.WAV`)
    const request = http.get(url, function (response) {
      response.pipe(file);
      fs.readFile(`./audio/bla.WAV`, async (err, data) => {
        const response = await fetch(`https://stt.api.cloud.yandex.net/speech/v1/stt:recognize`, {
          method: "POST",
          headers: { Authorization: `Api-Key ${yaKey}` },
          body: data
        })
        const result = await response.json()
        const message = result.result
        const forTranslate = {
          "sourceLanguageCode": "ru",
          "targetLanguageCode": "it",
          "texts": [message]
        }

        const respons = await fetch('https://translate.api.cloud.yandex.net/translate/v2/translate', {
          method: 'POST',
          headers: { Authorization: `Api-Key ${yaKey}` },
          body: JSON.stringify(forTranslate)
        })
        let translated = await respons.json()
        if (translated.translations === undefined) {
          await bot.sendMessage(chatId, 'Non ho capito (я не понял)')
        } else {
          let italiano = translated.translations[0].text.toLowerCase()
          if (italiano.includes('cibo') || italiano.includes('pizza')
            || italiano.includes('pasta') || italiano.includes('mangi')
            || italiano.includes('buono') || italiano.includes('fame')) {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/81c/b94/81cb94a5-6898-3351-8c34-216152f7c2ef/256/15.webp')
          };
          await bot.sendMessage(chatId, italiano)
        }
      })
    });
  }
})

