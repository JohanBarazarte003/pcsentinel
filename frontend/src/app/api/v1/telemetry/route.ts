// frontend/src/app/api/v1/telemetry/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usamos la SERVICE_ROLE_KEY para que el servidor pueda escribir métricas del agente
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de dispositivo no proporcionado" },
        { status: 401 }
      );
    }

    const deviceKey = authHeader.replace("Bearer ", "").trim();
    const body = await request.json();

    const { metrics, hostname, os_system } = body;

    // 1. Validar que el dispositivo exista mediante su device_key
    const { data: device, error: deviceError } = await supabaseAdmin
      .from("devices")
      .select("id")
      .eq("device_key", deviceKey)
      .single();

    if (deviceError || !device) {
      return NextResponse.json(
        { error: "Dispositivo no registrado o Token inválido" },
        { status: 404 }
      );
    }

    // 2. Insertar log de telemetría enviado por el agente Python
    const { error: telemetryError } = await supabaseAdmin
      .from("telemetry_logs")
      .insert({
        device_id: device.id,
        cpu_percent: metrics.cpu_percent,
        ram_percent: metrics.ram_percent,
        disk_percent: metrics.disk_percent,
        cpu_temp: metrics.cpu_temp || null,
      });

    if (telemetryError) {
      return NextResponse.json(
        { error: "Error guardando métricas", details: telemetryError.message },
        { status: 500 }
      );
    }

    // 3. Actualizar estado y fecha de última conexión
    let status = "online";
    if (metrics.cpu_percent > 90 || metrics.ram_percent > 95) {
      status = "warning";
    }

    await supabaseAdmin
      .from("devices")
      .update({
        hostname: hostname,
        os_info: os_system,
        status: status,
        last_seen: new Date().toISOString(),
      })
      .eq("id", device.id);

    return NextResponse.json({ success: true, message: "Telemetría recibida con éxito" });

  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}