import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "STN-DEMO";
  const orgId = searchParams.get("org_id");

  const sanitizedKey = key.replace(/[^A-Z0-9-]/gi, "");
  const customFileName = `PCSentinel_Setup_${sanitizedKey}.exe`;

  if (orgId) {
    // 1. Consultar tipo de cuenta y cantidad de equipos ya vinculados
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("account_type")
      .eq("id", orgId)
      .single();

    const { count: deviceCount } = await supabaseAdmin
      .from("devices")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId);

    // REFINAMIENTO 3: Si la cuenta es Personal y ya tiene 1 equipo, bloquear el registro de un segundo equipo
    if (org?.account_type === "personal" && (deviceCount || 0) >= 1) {
      return NextResponse.json(
        { 
          error: "Límite de 1 equipo alcanzado para cuentas de Uso Personal.",
          message: "Para vincular más computadoras, por favor actualiza tu cuenta a Plan Pro o Empresa en la sección Configuración."
        },
        { status: 403 }
      );
    }

    // 2. Registrar el dispositivo si está dentro del límite
    await supabaseAdmin.from("devices").upsert(
      {
        org_id: orgId,
        device_key: sanitizedKey,
        hostname: "Pendiente de vinculación...",
        os_info: "Windows",
        status: "offline",
      },
      { onConflict: "device_key" }
    );
  }

  const filePath = path.join(process.cwd(), "public", "downloads", "PCSentinel_Setup.exe");

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "El ejecutable base no existe aún en public/downloads/" },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${customFileName}"`,
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}