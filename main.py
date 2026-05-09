import os
import logging
from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes
)

# Logs
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Token Telegram
TOKEN = os.getenv("BOT_TOKEN")

# Vérification
if not TOKEN:
    raise ValueError("BOT_TOKEN manquant")

# Clavier boutons
keyboard = [
    ["🤖 Auto Trading", "✋ Manual Trading"],
    ["🔬 Quant IA", "📉 Backtest"],
    ["📈 Marché", "💰 Balance"],
    ["📊 Status", "❓ Help"]
]

reply_markup = ReplyKeyboardMarkup(
    keyboard,
    resize_keyboard=True
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🚀 Bienvenue sur Binance Trading Bot",
        reply_markup=reply_markup
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text

    if text == "📊 Status":
        await update.message.reply_text(
            "🧠 STATUS BOT\n\n"
            "Mode: Manual\n"
            "Pair: BTCUSDT\n"
            "Stratégie: RSI + EMA + MACD\n"
            "SL/TP: 1% / 2%"
        )

def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
    )

    logger.info("Bot lancé...")
    app.run_polling()

if __name__ == "__main__":
    main()
