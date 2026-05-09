async function getCandles() {
    try {
        const res = await axios.get(
            "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=50"
        );

        return res.data;

    } catch (err) {
        console.log("CANDLES ERROR:", err.message);
        return [];
    }
}
