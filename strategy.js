const { RSI, MACD, EMA } = require("technicalindicators");

function analyze(candles) {

    const closes = candles.map(c => c[4]);

    const rsi = RSI.calculate({ values: closes, period: 14 });
    const macd = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
    });

    const ema50 = EMA.calculate({ period: 50, values: closes });
    const ema200 = EMA.calculate({ period: 200, values: closes });

    const lastClose = closes[closes.length - 1];

    const trend = ema50[ema50.length - 1] > ema200[ema200.length - 1]
        ? "UP"
        : "DOWN";

    const rsiLast = rsi[rsi.length - 1];
    const macdLast = macd[macd.length - 1];

    let score = 0;

    // RSI
    if (rsiLast < 35) score++;
    if (rsiLast > 65) score++;

    // MACD
    if (macdLast?.MACD > macdLast?.signal) score++;
    else score++;

    // TREND FILTER
    if (trend === "UP" && score >= 3) return "BUY";
    if (trend === "DOWN" && score >= 3) return "SELL";

    return "WAIT";
}

module.exports = { analyze };
