import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAlertEmail } from "@/lib/email";

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

    // 1. Validar que el dispositivo exista y obtener datos de la Organización
    const { data: device, error: deviceError } = await supabaseAdmin
      .from("devices")
      .select("id, org_id, organizations(owner_id)")
      .eq("device_key", deviceKey)
      .single();

    if (deviceError || !device) {
      return NextResponse.json({ error: "Dispositivo no registrado" }, { status: 404 });
    }

    // 2. Guardar métricas temporales
    await supabaseAdmin.from("telemetry_logs").insert({
      device_id: device.id,
      cpu_percent: metrics.cpu_percent,
      ram_percent: metrics.ram_percent,
      disk_percent: metrics.disk_percent,
      cpu_temp: metrics.cpu_temp || null,
      gpu_temp: metrics.gpu_temp || null,
    });

    // 3. Evaluar estado de salud del equipo y generación de alertas
    let status = "online";
    let alertType = "";
    let alertMsg = "";

    if (metrics.is_thermal_throttling || (metrics.cpu_temp && metrics.cpu_temp >= 85)) {
      status = "warning";
      alertType = "Sobrecalentamiento Crítico";
      alertMsg = `El procesador del equipo ${hostname} alcanzó una temperatura crítica de ${metrics.cpu_temp}°C.`;
    } else if (metrics.gpu_temp && metrics.gpu_temp >= 85) {
      status = "warning";
      alertType = "Temperatura Alta en GPU";
      alertMsg = `La tarjeta gráfica Nvidia del equipo ${hostname} alcanzó los ${metrics.gpu_temp}°C.`;
    }

    // 4. Actualizar estado y Ficha Técnica
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

    // 5. SI OCURRIÓ UNA ALERTA CRÍTICA: Guardar en BD y enviar Email Notificación al usuario
    if (alertMsg) {
      await supabaseAdmin.from("alerts").insert({
        device_id: device.id,
        type: "HIGH_TEMP",
        severity: "critical",
        message: alertMsg,
      });

      // Obtener email del dueño de la cuenta desde Supabase Auth
      const ownerId = (device as any).organizations?.owner_id;
      if (ownerId) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(ownerId);
        if (userData?.user?.email) {
          // Enviar correo transaccional
          await sendAlertEmail({
            toEmail: userData.user.email,
            hostname: hostname,
            alertType: alertType,
            detailsMessage: alertMsg,
          });
        }
      }
    }

    // Consultar comandos pendientes de remediación
    const { data: pendingActions } = await supabaseAdmin
      .from("action_commands")
      .select("id, command_type, payload")
      .eq("device_id", device.id)
      .eq("status", "pending");

    return NextResponse.json({ 
      success: true, 
      message: "Telemetría procesada",
      pending_actions: pendingActions || []
    });

  } catch (err) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}