require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { getCandles, placeTrade, getBalance } = require("./trading");
const { analyze } = require("./strategy");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// 📢 TON CHANNEL (IMPORTANT)
const CHANNEL = "https://t.me/binance_trading10"; // ⚠️ change ici

let autoTrade = false;

// ===============================
// 🔐 CHECK ABONNEMENT
// ===============================
async function isMember(userId) {
    try {
        const res = await bot.getChatMember(CHANNEL, userId);

        const status = res.status;

        return (
            status === "member" ||
            status === "administrator" ||
            status === "creator"
        );

    } catch (err) {
        console.log("Erreur abonnement:", err.message);
        return false;
    }
}

// ===============================
// 🟢 MENU PRINCIPAL
// ===============================
function menu(chatId) {
    bot.sendMessage(chatId, "🤖 BOT TRADING PRO", {
        reply_markup: {
            keyboard: [
                ["📊 Signal", "🤖 Auto Trade"],
                ["💰 Balance", "ℹ️ Aide"]
            ],
            resize_keyboard: true
        }
    });
}

// ===============================
// 🚀 START (AVEC ABONNEMENT)
// ===============================
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const member = await isMember(userId);

    if (!member) {
        return bot.sendMessage(chatId,
`🚀 ACCÈS BLOQUÉ

Tu dois rejoindre le canal pour utiliser le bot :

👉 https://t.me/${CHANNEL.replace("@", "")}

Puis reviens et tape /start`
        );
    }

    menu(chatId);
});

// ===============================
// 📊 SIGNAL TRADING
// ===============================
bot.onText(/📊 Signal/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const member = await isMember(userId);
    if (!member) return;

    const candles = await getCandles();
    const signal = analyze(candles);

    bot.sendMessage(chatId, `📊 Signal actuel : ${signal}`);
});

// ===============================
// 🤖 AUTO TRADE ON/OFF
// ===============================
bot.onText(/🤖 Auto Trade/, (msg) => {
    autoTrade = !autoTrade;

    bot.sendMessage(msg.chat.id,
        autoTrade ? "🟢 Auto Trade ON" : "🔴 Auto Trade OFF"
    );
});

// ===============================
// 💰 BALANCE
// ===============================
bot.onText(/💰 Balance/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const member = await isMember(userId);
    if (!member) return;

    const balance = await getBalance();

    bot.sendMessage(chatId, `💰 Balance USDT: ${balance}`);
});

// ===============================
// ℹ️ AIDE
// ===============================
bot.onText(/ℹ️ Aide/, (msg) => {
    bot.sendMessage(msg.chat.id,
`🤖 BOT TRADING

- 📊 Analyse marché automatique
- 🤖 Auto trade
- ⛔ Stop Loss -1%
- 🎯 Take Profit +2%

⚠️ Trading = risque réel`
    );
});

// ===============================
// 🔁 AUTO TRADING LOOP
// ===============================
setInterval(async () => {
    if (!autoTrade) return;

    try {
        const candles = await getCandles();
        const signal = analyze(candles);

        const price = candles[candles.length - 1][4];

        if (signal === "BUY") {
            await placeTrade("BUY", price);
        }

        if (signal === "SELL") {
            await placeTrade("SELL", price);
        }

    } catch (err) {
        console.log("AutoTrade error:", err.message);
    }

}, 15000);
