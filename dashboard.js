const express = require("express");
const ccxt = require("ccxt");

const app = express();

const binance = new ccxt.binance();

app.get("/", async (req, res) => {

    try {

        const ticker = await binance.fetchTicker("BTC/USDT");

        const price = ticker.last;
        const high = ticker.high;
        const low = ticker.low;
        const volume = ticker.baseVolume;

        res.send(`
        <html>
        <head>
            <title>Binance Dashboard</title>
            <meta http-equiv="refresh" content="5">
            <style>
                body {
                    background: #0f172a;
                    color: white;
                    font-family: Arial;
                    padding: 20px;
                }

                .box {
                    background: #1e293b;
                    padding: 20px;
                    border-radius: 15px;
                    margin-top: 20px;
                }

                h1 {
                    color: #22c55e;
                }
            </style>
        </head>

        <body>
            <h1>📊 Binance Trading Dashboard</h1>

            <div class="box">
                <h2>BTC/USDT</h2>
                <p>💰 Prix: ${price}</p>
                <p>📈 High: ${high}</p>
                <p>📉 Low: ${low}</p>
                <p>📊 Volume: ${volume}</p>
            </div>
        </body>
        </html>
        `);

    } catch (err) {
        res.send("Erreur dashboard");
    }
});

app.listen(3000, () => {
    console.log("📊 Dashboard actif sur port 3000");
});
