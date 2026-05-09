require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { getCandles, placeTrade, getBalance } = require("./trading");
const { analyze } = require("./strategy");
const config = require("./config");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let autoTrade = false;

// 📌 START MENU
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
`🤖 BOT BINANCE PRO

📊 /signal - voir signal
🤖 Auto Trade ON/OFF
💰 Balance
📈 Analyse marché`
    );
});

// 📊 SIGNAL
bot.onText(/\/signal/, async (msg) => {
    const candles = await getCandles();
    const signal = analyze(candles);

    bot.sendMessage(msg.chat.id, `📊 Signal: ${signal}`);
});

// 🤖 AUTO TRADE TOGGLE
bot.onText(/Auto Trade ON|Auto Trade OFF/, (msg) => {
    autoTrade = !autoTrade;
    bot.sendMessage(msg.chat.id, autoTrade ? "🟢 AUTO ON" : "🔴 AUTO OFF");
});

// 💰 BALANCE
bot.onText(/\/balance/, async (msg) => {
    const balance = await getBalance();
    bot.sendMessage(msg.chat.id, `💰 Balance: ${balance} USDT`);
});

// 🔁 LOOP TRADING
setInterval(async () => {

    if (!autoTrade) return;

    const candles = await getCandles();
    const signal = analyze(candles);

    const lastPrice = candles[candles.length - 1][4];

    if (signal === "BUY") {
        await placeTrade("BUY", lastPrice);
    }

    if (signal === "SELL") {
        await placeTrade("SELL", lastPrice);
    }

}, 15000);
