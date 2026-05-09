require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { getCandles, placeTrade, getBalance } = require("./trading");
const { analyze } = require("./strategy");

// ===============================
// 🚀 START LOG + SAFETY
// ===============================
console.log("🤖 Bot démarré...");

// STOP si token manquant
if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN manquant dans .env");
    process.exit(1);
}

// ===============================
// 🤖 BOT INIT (STABLE RAILWAY)
// ===============================
const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: {
        interval: 1000,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// ===============================
// 👑 CONFIG
// ===============================
const OWNER_ID = 5161872804;
const CHANNEL = "@binance_trading10";
const CHANNEL_LINK = "https://t.me/binance_trading10";

let autoTrade = false;
let lastTrade = 0;

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
// 🚀 START COMMAND
// ===============================
bot.onText(/\/start/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const member = await isMember(userId);

        if (!member) {
            return bot.sendMessage(chatId,
`🚀 ACCÈS BLOQUÉ

👉 Rejoins le canal :
${CHANNEL_LINK}

Puis relance /start`
            );
        }

        menu(chatId);

    } catch (err) {
        console.log("START ERROR:", err.message);
    }
});

// ===============================
// 📊 SIGNAL
// ===============================
bot.onText(/📊 Signal/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const member = await isMember(userId);
        if (!member) return;

        const candles = await getCandles();
        const signal = analyze(candles);

        bot.sendMessage(chatId, `📊 Signal : ${signal}`);

    } catch (err) {
        console.log("SIGNAL ERROR:", err.message);
        bot.sendMessage(msg.chat.id, "❌ Erreur signal");
    }
});

// ===============================
// 🤖 AUTO TRADE (OWNER ONLY)
// ===============================
bot.onText(/🤖 Auto Trade/, (msg) => {
    const userId = msg.from.id;

    if (userId !== OWNER_ID) {
        return bot.sendMessage(msg.chat.id, "❌ Admin uniquement");
    }

    autoTrade = !autoTrade;

    bot.sendMessage(msg.chat.id,
        autoTrade ? "🟢 Auto Trade ON" : "🔴 Auto Trade OFF"
    );
});

// ===============================
// 💰 BALANCE
// ===============================
bot.onText(/💰 Balance/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const member = await isMember(userId);
        if (!member) return;

        const balance = await getBalance();

        if (!balance) {
            return bot.sendMessage(chatId, "⚠️ Balance indisponible");
        }

        bot.sendMessage(chatId, `💰 Balance USDT: ${balance}`);

    } catch (err) {
        console.log("BALANCE ERROR:", err.message);
        bot.sendMessage(msg.chat.id, "❌ Erreur balance Binance");
    }
});

// ===============================
// ℹ️ AIDE
// ===============================
bot.onText(/ℹ️ Aide/, (msg) => {
    bot.sendMessage(msg.chat.id,
`🤖 BOT TRADING PRO

📊 Signal
🤖 Auto Trade
💰 Balance
⛔ SL -1%
🎯 TP +2%

📢 Canal:
${CHANNEL_LINK}

⚠️ Trading = risque`
    );
});

// ===============================
// 🔁 AUTO TRADE LOOP SAFE
// ===============================
setInterval(async () => {
    try {
        if (!autoTrade) return;

        const now = Date.now();
        if (now - lastTrade < 60000) return;

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
        console.log("AUTO TRADE ERROR:", err.message);
    }

}, 15000);
