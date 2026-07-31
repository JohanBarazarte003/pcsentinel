import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const apiKey = process.env.RESEND_API_KEY;

  // 1. Verificar si Next.js leyó la API Key de .env.local
  if (!apiKey) {
    return NextResponse.json(
      { 
        error: "RESEND_API_KEY no encontrada en .env.local",
        solucion: "Agrega RESEND_API_KEY=re_... a tu archivo .env.local y REINICIA la terminal con npm run dev"
      },
      { status: 500 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "Proporciona un email en la URL: ?email=tu_correo@gmail.com" },
      { status: 400 }
    );
  }

  try {
    const resend = new Resend(apiKey);

    // 2. Intentar enviar el correo mediante Resend
    const response = await resend.emails.send({
      from: "PC Sentinel <onboarding@resend.dev>",
      to: [email],
      subject: "⚠️ Alerta Crítica de Prueba - PC Sentinel",
      html: `
        <div style="background-color: #0f172a; color: #ffffff; padding: 24px; font-family: sans-serif; border-radius: 16px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #10b981; margin-top: 0;">PC Sentinel - Notificación de Prueba</h2>
          <p style="color: #cbd5e1; font-size: 14px;">¡Hola! El sistema de notificaciones de PC Sentinel está 100% activo y configurado.</p>
          <div style="background-color: #1e293b; padding: 12px 16px; border-left: 4px solid #10b981; margin: 16px 0; border-radius: 6px;">
            <p style="margin: 0; font-weight: bold; color: #10b981; font-size: 13px;">Prueba Exitosa de Notificación</p>
          </div>
          <p style="color: #64748b; font-size: 11px; margin-bottom: 0;">PC Sentinel • Monitoreo, Protección y Rendimiento</p>
        </div>
      `,
    });

    // 3. Si Resend rechaza la petición por restricción de dominio/destinatario
    if (response.error) {
      return NextResponse.json(
        { 
          error: "Resend rechazó el envío de correo", 
          detalles: response.error,
          causa_probable: "En cuentas gratuitas de Resend sin dominio propio, 'email' DEBE SER exactamente la misma dirección con la que te registraste en Resend.com"
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      resend_id: response.data?.id,
      message: `Correo enviado a ${email}. Revisa tu bandeja de entrada o la carpeta de SPAM.`,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Excepción al enviar email", detalles: err.message },
      { status: 500 }
    );
  }
}