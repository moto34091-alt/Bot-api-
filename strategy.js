function analyze(candles) {
    if (!candles || candles.length < 10) {
        return "NO_SIGNAL";
    }

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    const close1 = parseFloat(prev[4]);
    const close2 = parseFloat(last[4]);

    // simple momentum strategy
    if (close2 > close1) {
        return "BUY";
    }

    if (close2 < close1) {
        return "SELL";
    }

    return "NO_SIGNAL";
}

module.exports = { analyze };
