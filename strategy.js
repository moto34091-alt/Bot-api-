async function getCandles() {
    try {
        const res = await axios.get(
            "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=50"
        );

        if (!res.data || res.data.length === 0) return [];

        return res.data;

    } catch (err) {
        console.log("CANDLES ERROR:", err.message);
        return [];
    }
}
