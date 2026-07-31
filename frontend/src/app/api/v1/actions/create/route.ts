import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { deviceId, commandType, payload } = await request.json();

    if (!deviceId || !commandType) {
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 });
    }

    // Insertar el comando pendiente para que la PC lo ejecute
    const { data: action, error } = await supabase
      .from("action_commands")
      .insert({
        device_id: deviceId,
        command_type: commandType,
        payload: payload || {},
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action });

  } catch (err) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}