require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { getCandles, placeTrade, getBalance } = require("./trading");
const { analyze } = require("./strategy");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ===============================
// 👑 CONFIG
// ===============================
const OWNER_ID = 5161872804; // ton ID Telegram
const CHANNEL = "@binance_trading10";
const CHANNEL_LINK = "https://t.me/binance_trading10";

let autoTrade = false;

// ===============================
// 🔐 CHECK ABONNEMENT
// ===============================
async function isMember(userId) {

    if (userId === OWNER_ID) return true;

    try {
        const res = await bot.getChatMember(CHANNEL, userId);

        return ["member", "administrator", "creator"].includes(res.status);

    } catch (err) {
        console.log("Abonnement error:", err.message);
        return false;
    }
}

// ===============================
// 🟢 MENU
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
// 🚀 START
// ===============================
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const member = await isMember(userId);

    if (!member) {
        return bot.sendMessage(chatId,
`🚀 ACCÈS BLOQUÉ

Tu dois rejoindre le canal :

👉 ${CHANNEL_LINK}

Puis relance /start`
        );
    }

    menu(chatId);
});

// ===============================
// 📊 SIGNAL
// ===============================
bot.onText(/📊 Signal/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const member = await isMember(userId);
    if (!member) return;

    try {
        const candles = await getCandles();
        const signal = analyze(candles);

        bot.sendMessage(chatId, `📊 Signal : ${signal}`);

    } catch (err) {
        console.log(err.message);
        bot.sendMessage(chatId, "❌ Erreur signal");
    }
});

// ===============================
// 🤖 AUTO TRADE (OWNER ONLY)
// ===============================
bot.onText(/🤖 Auto Trade/, (msg) => {
    const userId = msg.from.id;

    if (userId !== OWNER_ID) {
        return bot.sendMessage(msg.chat.id,
            "❌ Seul l'admin peut activer Auto Trade"
        );
    }

    autoTrade = !autoTrade;

    bot.sendMessage(msg.chat.id,
        autoTrade ? "🟢 Auto Trade ON" : "🔴 Auto Trade OFF"
    );
});

// ===============================
// 💰 BALANCE (FIX SANS ERREUR)
// ===============================
bot.onText(/💰 Balance/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const member = await isMember(userId);
    if (!member) return;

    try {
        const balance = await getBalance();

        if (!balance) {
            return bot.sendMessage(chatId, "⚠️ Balance indisponible");
        }

        bot.sendMessage(chatId, `💰 Balance USDT: ${balance}`);

    } catch (err) {
        console.log("BALANCE ERROR:", err.message);

        bot.sendMessage(chatId,
            "❌ Impossible de récupérer la balance Binance"
        );
    }
});

// ===============================
// ℹ️ AIDE
// ===============================
bot.onText(/ℹ️ Aide/, (msg) => {
    bot.sendMessage(msg.chat.id,
`🤖 BOT TRADING PRO

📊 Signal automatique
🤖 Auto Trade
💰 Balance Binance
⛔ SL -1%
🎯 TP +2%

📢 Canal: ${CHANNEL_LINK}

⚠️ Trading = risque`
    );
});

// ===============================
// 🔁 AUTO TRADE LOOP
// ===============================
let lastTrade = 0;

setInterval(async () => {

    if (!autoTrade) return;

    const now = Date.now();

    if (now - lastTrade < 60000) return;

    try {
        const candles = await getCandles();
        const signal = analyze(candles);

        const price = candles[candles.length - 1][4];

        if (signal === "BUY") {
            await placeTrade("BUY", price);
            lastTrade = now;
        }

        if (signal === "SELL") {
            await placeTrade("SELL", price);
            lastTrade = now;
        }

    } catch (err) {
        console.log("AutoTrade error:", err.message);
    }

}, 15000);
