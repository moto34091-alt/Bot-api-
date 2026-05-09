function detectLiquidity(candles) {

    const last = candles[candles.length - 1];

    const high = last[2];
    const low = last[3];

    return {
        liquidityHigh: high,
        liquidityLow: low
    };
}

module.exports = { detectLiquidity };
