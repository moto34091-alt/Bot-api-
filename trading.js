const ccxt = require("ccxt");

const binance = new ccxt.binance({
    apiKey: process.env.BINANCE_KEY,
    secret: process.env.BINANCE_SECRET,
    enableRateLimit: true
});

async function getBalance() {
    try {
        const balance = await binance.fetchBalance();

        return balance.total.USDT || 0;

    } catch (err) {
        console.log("BINANCE ERROR:", err.message);
        throw new Error("Balance fetch failed");
    }
}

module.exports = { getBalance };
