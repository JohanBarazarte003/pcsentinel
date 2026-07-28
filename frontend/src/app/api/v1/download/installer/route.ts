import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "STN-DEMO";

  // Sanitizar el token por seguridad
  const sanitizedKey = key.replace(/[^A-Z0-9-]/gi, "");
  const customFileName = `PCSentinel_Setup_${sanitizedKey}.exe`;

  // Ruta al instalador binario compilado guardado en la carpeta pública
  const filePath = path.join(process.cwd(), "public", "downloads", "PCSentinel_Setup.exe");

  // Si el archivo binario no existe aún en el servidor local, avisamos al desarrollador
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      {
        message: "Para habilitar la descarga directa, compila agent/installer.py con PyInstaller y coloca PCSentinel_Setup.exe en frontend/public/downloads/",
        downloaded_key: sanitizedKey,
        expected_filename: customFileName
      },
      { status: 200 }
    );
  }

  // Leer el binario
  const fileBuffer = fs.readFileSync(filePath);

  // Retornar el archivo con las cabeceras HTTP de descarga forzada y nombre dinámico
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${customFileName}"`,
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}