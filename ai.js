function predictMarket(trend, volume, volatility) {

    let score = 0;

    if (trend === "UP") score += 2;
    if (volume > 1000) score += 2;
    if (volatility > 1) score += 1;

    if (score >= 4) {
        return "STRONG BUY";
    }

    if (score <= 1) {
        return "SELL";
    }

    return "WAIT";
}

module.exports = { predictMarket };
