import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const deviceKey = authHeader.replace("Bearer ", "").trim();
    const body = await request.json();

    const { metrics, hostname, os_system, hardware_specs } = body;

    // 1. Validar que el dispositivo exista
    const { data: device, error: deviceError } = await supabaseAdmin
      .from("devices")
      .select("id")
      .eq("device_key", deviceKey)
      .single();

    if (deviceError || !device) {
      return NextResponse.json({ error: "Dispositivo no registrado" }, { status: 404 });
    }

    // 2. Guardar métricas temporales de rendimiento (CPU, RAM, Disco, Temp CPU, Temp GPU)
    await supabaseAdmin.from("telemetry_logs").insert({
      device_id: device.id,
      cpu_percent: metrics.cpu_percent,
      ram_percent: metrics.ram_percent,
      disk_percent: metrics.disk_percent,
      cpu_temp: metrics.cpu_temp || null,
      gpu_temp: metrics.gpu_temp || null, // <--- GUARDAR TEMPERATURA GPU
    });

    // 3. Evaluar estado de salud del equipo
    let status = "online";
    if (metrics.cpu_percent > 90 || metrics.ram_percent > 95 || metrics.is_thermal_throttling) {
      status = "warning";
    }

    // 4. Actualizar estado y Ficha Técnica de Hardware Completa en Supabase
    await supabaseAdmin
      .from("devices")
      .update({
        hostname: hostname,
        os_info: os_system,
        hardware_specs: hardware_specs || {},
        status: status,
        last_seen: new Date().toISOString(),
      })
      .eq("id", device.id);

    return NextResponse.json({ success: true, message: "Telemetría y temperaturas procesadas con éxito" });

  } catch (err) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}