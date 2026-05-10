const axios = require("axios");
const crypto = require("crypto");

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;

const BASE_URL = "https://api.binance.com";

function sign(query) {
    return crypto
        .createHmac("sha256", API_SECRET)
        .update(query)
        .digest("hex");
}

async function getBalance() {
    try {

        if (!API_KEY || !API_SECRET) {
            console.log("❌ Binance keys manquantes");
            return null;
        }

        const timestamp = Date.now();

        const query = `timestamp=${timestamp}&recvWindow=5000`;

        const signature = sign(query);

        const url = `${BASE_URL}/api/v3/account?${query}&signature=${signature}`;

        const res = await axios.get(url, {
            headers: {
                "X-MBX-APIKEY": API_KEY
            }
        });

        const usdt = res.data.balances.find(b => b.asset === "USDT");

        return usdt ? parseFloat(usdt.free).toFixed(2) : 0;

    } catch (err) {
        console.log(
            "BINANCE BALANCE ERROR:",
            err.response?.data || err.message
        );
        return null;
    }
}

module.exports = { getBalance };
