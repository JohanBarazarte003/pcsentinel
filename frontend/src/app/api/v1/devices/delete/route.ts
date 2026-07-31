import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// Usamos el cliente de administración para saltar bloqueos de claves foráneas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 1. Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ error: "ID de dispositivo requerido" }, { status: 400 });
    }

    // 2. Obtener la organización del usuario
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    // 3. Eliminar datos vinculados primero (Logs, Alertas y Comandos)
    await supabaseAdmin.from("telemetry_logs").delete().eq("device_id", deviceId);
    await supabaseAdmin.from("alerts").delete().eq("device_id", deviceId);
    await supabaseAdmin.from("action_commands").delete().eq("device_id", deviceId);

    // 4. Eliminar el dispositivo de la organización
    const { error } = await supabaseAdmin
      .from("devices")
      .delete()
      .eq("id", deviceId)
      .eq("org_id", org.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Dispositivo desvinculado con éxito" });

  } catch (err: any) {
    return NextResponse.json({ error: "Error desvinculando dispositivo", details: err.message }, { status: 500 });
  }
}