const ccxt = require("ccxt");
const config = require("./config");
const { getSLTP } = require("./risk");

const binance = new ccxt.binance({
    apiKey: process.env.BINANCE_KEY,
    secret: process.env.BINANCE_SECRET,
    enableRateLimit: true
});

async function getCandles() {
    return await binance.fetchOHLCV(config.symbol, config.timeframe, undefined, 100);
}

async function getBalance() {
    const balance = await binance.fetchBalance();
    return balance.total.USDT;
}

async function placeTrade(side, price) {
    const sltp = getSLTP(price, side);

    console.log("TRADE:", side);
    console.log("SL:", sltp.stopLoss);
    console.log("TP:", sltp.takeProfit);

    // ⚠️ ici tu peux activer ordre réel
    // await binance.createMarketOrder(config.symbol, side.toLowerCase(), amount);
}

module.exports = { getCandles, placeTrade, getBalance };
