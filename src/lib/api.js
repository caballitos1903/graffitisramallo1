import { supabase } from "@/lib/customSupabaseClient";

/* ================================
   🎨 GRAFFITTIS
================================ */
export const getApprovedGraffittis = async () => {
  const { data, error } = await supabase
    .from("graffittis")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching approved graffittis:", error);
    return [];
  }
  return data || [];
};

export const getAllGraffittis = async () => {
  const { data, error } = await supabase
    .from("graffittis")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching all graffittis:", error);
    return [];
  }
  return data || [];
};

export const createGraffiti = async (graffitiData) => {
  try {
    const { data, error } = await supabase
      .from("graffittis")
      .insert([graffitiData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error("❌ Error creating graffiti:", err);
    return null;
  }
};

export const approveGraffiti = async (id) => {
  const { error } = await supabase
    .from("graffittis")
    .update({ approved: true })
    .eq("id", id);

  if (error) {
    console.error("❌ Error approving graffiti:", error);
    return false;
  }
  return true;
};

export const deleteGraffiti = async (id) => {
  const { error } = await supabase
    .from("graffittis")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("❌ Error deleting graffiti:", error);
    return false;
  }
  return true;
};

/* ================================
   ⚙️ SETTINGS
================================ */
export const getSettings = async () => {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle(); // ✅ evita error 404 si no hay registro

  if (error || !data) {
    console.warn(
      "⚠️ No se encontraron settings en Supabase, usando valores por defecto."
    );
    return {
      price_simple: 200,
      price_with_image: 1000,
      trx_wallet: "",
      usdt_wallet: "",
      busd_wallet: "",
    };
  }

  return data;
};

export const updateSettings = async (newSettings) => {
  const { error } = await supabase
    .from("settings")
    .update(newSettings)
    .eq("id", 1);

  if (error) {
    console.error("❌ Error updating settings:", error);
    return false;
  }
  return true;
};

/* ================================
   🖼️ STORAGE
================================ */
export const uploadImage = async (file) => {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;
  const filePath = `public/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("graffiti-images")
    .upload(filePath, file);

  if (uploadError) {
    console.error("❌ Error uploading image:", uploadError);
    return null;
  }

  const { data } = supabase.storage
    .from("graffiti-images")
    .getPublicUrl(filePath);

  return data?.publicUrl || null;
};

/* ================================
   💰 MERCADO PAGO
================================ */
export const createPreference = async (amount, title, graffiti_id) => {
  try {
    // 🌎 Detectar entorno actual
    const API_BASE_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:4000"
        : "https://libertrades.xyz";

    console.log("🟦 Creando preferencia en:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/create-mp-preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, title, graffiti_id }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("❌ Error del servidor Node:", errData);
      throw new Error(`Error al conectar con el servidor: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Preferencia creada correctamente:", data);

    // ✅ Redirigir a Mercado Pago
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      console.warn('⚠️ No se encontró "init_point" en la respuesta:', data);
    }

    return data;
  } catch (error) {
    console.error("❌ Error en createPreference:", error);
    return null;
  }
};
