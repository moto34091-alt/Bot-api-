function positionSize(balance, riskPercent) {
    return balance * (riskPercent / 100);
}

function getSLTP(entryPrice, side) {
    if (side === "BUY") {
        return {
            stopLoss: entryPrice * 0.99,
            takeProfit: entryPrice * 1.02
        };
    }

    return {
        stopLoss: entryPrice * 1.01,
        takeProfit: entryPrice * 0.98
    };
}

module.exports = { positionSize, getSLTP };
