async function getBalance() {
    try {
        if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
            console.log("❌ Clés Binance manquantes");
            return null;
        }

        const timestamp = Date.now();
        const query = `timestamp=${timestamp}&recvWindow=5000`;

        const signature = crypto
            .createHmac("sha256", process.env.BINANCE_API_SECRET)
            .update(query)
            .digest("hex");

        const url = `https://api.binance.com/api/v3/account?${query}&signature=${signature}`;

        const res = await axios.get(url, {
            headers: {
                "X-MBX-APIKEY": process.env.BINANCE_API_KEY
            }
        });

        const usdt = res.data.balances.find(b => b.asset === "USDT");

        return usdt ? Number(usdt.free).toFixed(2) : 0;

    } catch (err) {
        console.log("BALANCE ERROR:", err.response?.data || err.message);
        return null;
    }
}
