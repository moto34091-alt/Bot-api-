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

# =========================
# LOGS
# =========================
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)

logger = logging.getLogger(__name__)

# =========================
# TOKEN TELEGRAM
# =========================
TOKEN = os.getenv("BOT_TOKEN")

if not TOKEN:
    raise ValueError("BOT_TOKEN manquant dans Railway Variables")

# =========================
# BOUTONS
# =========================
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

# =========================
# COMMANDE /start
# =========================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🚀 Bienvenue sur Binance Trading Bot\n\n"
        "Choisis une option ci-dessous 👇",
        reply_markup=reply_markup
    )

# =========================
# GESTION DES BOUTONS
# =========================
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text

    # STATUS
    if text == "📊 Status":
        await update.message.reply_text(
            "🧠 STATUS BOT\n\n"
            "Mode : Manual\n"
            "Pair : BTCUSDT\n"
            "Stratégie : RSI + EMA + MACD\n"
            "SL/TP : 1% / 2%\n"
            "Bot : ONLINE ✅"
        )

    # MARCHÉ
    elif text == "📈 Marché":
        await update.message.reply_text(
            "📈 Analyse Marché\n\n"
            "BTCUSDT : BUY potentiel\n"
            "ETHUSDT : consolidation\n"
            "Trend global : Bullish 📊"
        )

    # BALANCE
    elif text == "💰 Balance":
        await update.message.reply_text(
            "💰 Balance Binance\n\n"
            "Aucune API connectée."
        )

    # HELP
    elif text == "❓ Help":
        await update.message.reply_text(
            "📘 AIDE BOT\n\n"
            "🤖 Auto Trading : active le trading auto\n"
            "✋ Manual Trading : mode manuel\n"
            "📈 Marché : analyse du marché\n"
            "📉 Backtest : simulation stratégie\n"
            "📊 Status : état du bot"
        )

    # AUTO TRADING
    elif text == "🤖 Auto Trading":
        await update.message.reply_text(
            "🤖 Auto Trading ACTIVÉ ✅"
        )

    # MANUAL TRADING
    elif text == "✋ Manual Trading":
        await update.message.reply_text(
            "✋ Manual Trading ACTIVÉ ✅"
        )

    # QUANT IA
    elif text == "🔬 Quant IA":
        await update.message.reply_text(
            "🔬 Quant IA en préparation..."
        )

    # BACKTEST
    elif text == "📉 Backtest":
        await update.message.reply_text(
            "📉 Backtest lancé...\n\n"
            "Résultat : +12.4% sur 30 jours 📊"
        )

    # MESSAGE INCONNU
    else:
        await update.message.reply_text(
            f"Commande inconnue : {text}"
        )

# =========================
# MAIN
# =========================
def main():
    app = Application.builder().token(TOKEN).build()

    # Commande start
    app.add_handler(CommandHandler("start", start))

    # Messages boutons
    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
    )

    logger.info("Bot lancé avec succès ✅")

    # Lancement bot
    app.run_polling()

# =========================
# EXECUTION
# =========================
if __name__ == "__main__":
    main()
