async function sendTP(bot, chatId, price) {

    bot.sendMessage(chatId,
        `🎯 TAKE PROFIT HIT

💰 Prix: ${price}`
    );
}

async function sendSL(bot, chatId, price) {

    bot.sendMessage(chatId,
        `⛔ STOP LOSS HIT

💰 Prix: ${price}`
    );
}

module.exports = { sendTP, sendSL };
