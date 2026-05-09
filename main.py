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
TOKEN = os.getenv("8031005605:AAHXVe8S47BS3TNnnaQ_556kpKi8H36pdiU")

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

    elif text == "📈 Marché":
        await update.message.reply_text(
            "📈 Analyse marché\n\n"
            "BTCUSDT: BUY potentiel\n"
            "Trend: Bullish"
        )

    elif text == "💰 Balance":
        await update.message.reply_text(
            "💰 Balance Binance\n\n"
            "Connecte ton API Binance pour afficher la balance."
        )

    elif text == "❓ Help":
        await update.message.reply_text(
            "Utilise les boutons pour naviguer dans le bot."
        )

    elif text == "🤖 Auto Trading":
        await update.message.reply_text(
            "🤖 Mode Auto Trading activé (simulation)"
        )

    elif text == "✋ Manual Trading":
        await update.message.reply_text(
            "✋ Mode Manual Trading activé"
        )

    elif text == "🔬 Quant IA":
        await update.message.reply_text(
            "🔬 Quant IA en préparation..."
        )

    elif text == "📉 Backtest":
        await update.message.reply_text(
            "📉 Backtest disponible bientôt."
        )

    else:
        await update.message.reply_text(f"Commande reçue : {text}")


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
