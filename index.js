import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();
const port = process.env.PORT || 3000;

// 🔐 Variáveis de ambiente (Render)
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;

// Endpoint protegido
app.get("/saldo", async (req, res) => {
  const token = req.query.token;
  if (token !== ACCESS_TOKEN) {
    return res.status(401).json({ erro: "Acesso não autorizado" });
  }

  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac("sha256", BINANCE_API_SECRET)
      .update(queryString)
      .digest("hex");

    const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`;

    const response = await axios.get(url, {
      headers: { "X-MBX-APIKEY": BINANCE_API_KEY },
    });

    const balances = response.data.balances
      .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b) => ({
        asset: b.asset,
        free: b.free,
        locked: b.locked,
      }));

    res.json(balances);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ erro: "Erro ao consultar Binance" });
  }
});

app.listen(port, () => console.log(`✅ Servidor rodando na porta ${port}`));
