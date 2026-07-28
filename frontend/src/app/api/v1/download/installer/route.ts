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

  // 1. Registrar automáticamente el dispositivo en la base de datos vinculado a la organización
  if (orgId) {
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

  // 2. Buscar el ejecutable base
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