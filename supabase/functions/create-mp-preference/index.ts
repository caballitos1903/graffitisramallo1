// Supabase Edge Function para crear preferencias de Mercado Pago
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { amount, title, graffiti_id } = await req.json()

    // 🔐 Leer el token desde variables de entorno del proyecto Supabase
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")
    if (!mpToken) throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN")

    // ✅ Crear preferencia en Mercado Pago
    const preference = {
      items: [
        {
          title: title || "Publicación en Graffittis en Ramallo",
          quantity: 1,
          unit_price: Number(amount),
          currency_id: "ARS",
        },
      ],
      metadata: { graffiti_id },
      back_urls: {
        success: "https://tu-sitio.com/success",
        failure: "https://tu-sitio.com/failure",
        pending: "https://tu-sitio.com/pending",
      },
      auto_return: "approved",
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    })

    if (!response.ok) throw new Error(`Error Mercado Pago: ${response.status}`)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Error Mercado Pago:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
