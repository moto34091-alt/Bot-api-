require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { getCandles, placeTrade, getBalance } = require("./trading");
const { analyze } = require("./strategy");

// ===============================
// 🚀 START
// ===============================
console.log("🤖 Bot démarré...");

if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN manquant dans .env");
    process.exit(1);
}

// ===============================
// 🤖 BOT INIT
// ===============================
const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: {
        interval: 1000,
        autoStart: true,
        params: { timeout: 10 }
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
                ["💰 Balance", "📡 Live"],
                ["ℹ️ Aide"]
            ],
            resize_keyboard: true
        }
    });
}

// ===============================
// 🚀 START
// ===============================
bot.onText(/\/start/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const member = await isMember(userId);

        if (!member) {
            return bot.sendMessage(chatId,
`🚀 ACCÈS BLOQUÉ

👉 Rejoins :
${CHANNEL_LINK}

Puis /start`
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
        const candles = await getCandles();

        if (!candles || candles.length < 10) {
            return bot.sendMessage(msg.chat.id, "⚠️ Pas assez de données");
        }

        const signal = analyze(candles);

        bot.sendMessage(msg.chat.id, `📊 Signal : ${signal}`);

    } catch (err) {
        console.log("SIGNAL ERROR:", err.message);
        bot.sendMessage(msg.chat.id, "❌ Erreur signal");
    }
});

// ===============================
// 🤖 AUTO TRADE
// ===============================
bot.onText(/🤖 Auto Trade/, (msg) => {
    if (msg.from.id !== OWNER_ID) {
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
        const balance = await getBalance();

        if (balance === null) {
            return bot.sendMessage(msg.chat.id, "⚠️ Balance indisponible");
        }

        bot.sendMessage(msg.chat.id, `💰 Balance USDT: ${balance}`);

    } catch (err) {
        console.log("BALANCE ERROR:", err.message);
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
📡 Live`
    );
});

// ===============================
// 📡 LIVE DASHBOARD (FIX STABLE)
// ===============================
let liveInterval = null;
let liveMessageId = null;

bot.onText(/📡 Live/, async (msg) => {
    const chatId = msg.chat.id;

    const message = await bot.sendMessage(chatId, "📡 Initialisation live...");
    liveMessageId = message.message_id;

    if (liveInterval) clearInterval(liveInterval);

    liveInterval = setInterval(async () => {
        try {
            const candles = await getCandles();

            if (!candles || candles.length < 5) {
                console.log("❌ Candles invalides");
                return;
            }

            const signal = analyze(candles) || "NO_SIGNAL";

            const lastPrice = Number(candles[candles.length - 1][4]);
            const prevPrice = Number(candles[candles.length - 2][4]);

            const trend = lastPrice > prevPrice ? "📈 UP" : "📉 DOWN";

            const balance = await getBalance();

            const chart = generateMiniChart(candles);

            const text = `
📊 LIVE BINANCE BOT

💰 BTC/USDT: ${lastPrice}
📈 Signal: ${signal}
📊 Trend: ${trend}

🕯️ ${chart}

💵 Balance: ${balance ?? "N/A"}

⏱️ ${new Date().toLocaleTimeString()}
            `;

            await bot.editMessageText(text, {
                chat_id: chatId,
                message_id: liveMessageId
            });

        } catch (err) {
            console.log("LIVE ERROR:", err.message);
        }
    }, 7000);
});

// ===============================
// 📈 MINI CHART
// ===============================
function generateMiniChart(candles) {
    if (!candles || candles.length < 10) return "[no data]";

    const closes = candles.slice(-10).map(c => Number(c[4]));

    const max = Math.max(...closes);
    const min = Math.min(...closes);

    let chart = "";

    for (let price of closes) {
        const n = (price - min) / (max - min + 0.0001);

        if (n > 0.8) chart += "█";
        else if (n > 0.6) chart += "▆";
        else if (n > 0.4) chart += "▄";
        else if (n > 0.2) chart += "▂";
        else chart += "▁";
    }

    return chart;
}
