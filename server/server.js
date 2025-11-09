import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

/* ================================
   ⚙️ CONFIG ENV
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga variables .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

/* ================================
   🌐 CORS CONFIG
================================ */
app.use(
  cors({
    origin: [
      "https://libertrades.xyz",
      "https://www.libertrades.xyz",
      "https://graffitisramallo1.onrender.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================
   🌐 VARIABLES
================================ */
const isProduction = process.env.NODE_ENV === "production";

const BASE_URL = isProduction
  ? "https://libertrades.xyz"
  : "http://localhost:5173";

const WEBHOOK_URL = isProduction
  ? "https://libertrades.xyz/webhook"
  : "http://localhost:4000/webhook";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Faltan variables de Supabase en .env");
  process.exit(1);
}

// 🧩 Cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

/* ================================
   🔵 CREAR PREFERENCIA MP
================================ */
app.post("/create-mp-preference", async (req, res) => {
  try {
    console.log("📩 Recibido en /create-mp-preference:", req.body);

    const { amount, title, graffiti_id } = req.body;
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!mpToken) {
      console.error("❌ FALTA MERCADOPAGO_ACCESS_TOKEN en .env");
      return res.status(500).json({ error: "Falta MERCADOPAGO_ACCESS_TOKEN" });
    }

    const price = Number(amount);
    if (isNaN(price) || price <= 0) {
      console.error("❌ Monto inválido:", amount);
      return res.status(400).json({ error: "Monto inválido" });
    }

    const preference = {
      items: [
        {
          title: title || "Publicación en Graffittis Ramallo",
          quantity: 1,
          unit_price: price,
          currency_id: "ARS",
        },
      ],
      metadata: { graffiti_id: String(graffiti_id) },
      back_urls: {
        success: `${BASE_URL}/success`,
        failure: `${BASE_URL}/failure`,
        pending: `${BASE_URL}/pending`,
      },
      auto_return: "approved",
      notification_url: WEBHOOK_URL,
    };

    console.log("📦 Enviando preferencia a Mercado Pago...");
    console.log("🔑 Token parcial:", mpToken.slice(0, 15) + "...");

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mpToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preference),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Error desde Mercado Pago:", data);
      return res.status(response.status).json(data);
    }

    console.log("✅ Preferencia creada correctamente:", data.id);
    return res.json(data);
  } catch (err) {
    console.error("🔥 Error en servidor:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ================================
   🟢 WEBHOOK MP
================================ */
app.post("/webhook", async (req, res) => {
  try {
    console.log("📬 Webhook recibido:", JSON.stringify(req.body, null, 2));

    const { type, data } = req.body || {};

    if (type === "payment" && data?.id) {
      const paymentId = data.id;

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const paymentData = await paymentResponse.json();
      console.log("💰 Pago confirmado:", paymentData);

      if (paymentData?.status === "approved") {
        const graffitiId = paymentData?.metadata?.graffiti_id;
        if (graffitiId) {
          console.log(`✅ Marcando graffiti ${graffitiId} como aprobado...`);

          const { error } = await supabase
            .from("graffittis")
            .update({ approved: true })
            .eq("id", graffitiId);

          if (error) {
            console.error("❌ Error actualizando graffiti:", error);
          } else {
            console.log("🟩 Graffiti aprobado con éxito en Supabase.");
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("🔥 Error en webhook:", err);
    res.sendStatus(500);
  }
});

/* ================================
   🧩 SERVIR FRONTEND EN PRODUCCIÓN
================================ */
if (isProduction) {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));

  // ✅ Express 5: usar app.use() como catch-all
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

/* ================================
   🚀 INICIO DEL SERVIDOR
================================ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(
    `🚀 Servidor corriendo en ${
      isProduction
        ? `https://libertrades.xyz (puerto ${PORT})`
        : `http://localhost:${PORT}`
    }`
  );
});
