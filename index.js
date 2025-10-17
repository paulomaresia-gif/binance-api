import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();
app.use(express.json());

// 🔑 Substitua pelos seus valores da Binance
const BINANCE_API_KEY = "PRHyrbImXb0L8DAtNDg4aNDVvEtOCJIXGUKpQ27TLMTamg6171YhWGPYZ9owldSA";
const BINANCE_API_SECRET = "9tXOlBB2cmatCGtEm8CMJEUU2swZ0wM6yyPcoyu8V33L15U7qakgOi3xbkVCNMRN";

// 🔒 Senha simples para proteger o acesso (você escolhe)
const ACCESS_TOKEN = "Mare492100";

// Teste básico
app.get("/", (req, res) => res.send("Servidor Binance rodando com sucesso!"));

// Endpoint para consultar o saldo
app.get("/saldo", async (req, res) => {
  if (req.query.token !== ACCESS_TOKEN) {
    return res.status(401).json({ erro: "Token inválido" });
  }

  try {
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac("sha256", BINANCE_API_SECRET)
      .update(query)
      .digest("hex");

    const response = await axios.get(
      `https://api1.binance.com/api/v3/account?${query}&signature=${signature}`,
      { headers: { "X-MBX-APIKEY": BINANCE_API_KEY } }
    );

    // Filtra apenas as moedas com saldo > 0
    const ativos = response.data.balances
      .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b) => ({
        moeda: b.asset,
        livre: b.free,
        bloqueado: b.locked,
      }));

    res.json(ativos);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ erro: "Erro ao consultar Binance" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor online na porta", PORT));
