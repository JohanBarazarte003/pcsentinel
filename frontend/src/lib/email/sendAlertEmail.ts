import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendAlertEmailParams {
  toEmail: string;
  hostname: string;
  alertType: string;
  detailsMessage: string;
}

export async function sendAlertEmail({
  toEmail,
  hostname,
  alertType,
  detailsMessage,
}: SendAlertEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API Key no configurada. Omitiendo envío de correo.");
    return;
  }

  try {
    await resend.emails.send({
      from: "PC Sentinel Alertas <onboarding@resend.dev>", // En producción cambiar por tu dominio propio
      to: toEmail,
      subject: `⚠️ Alerta Crítica en PC Sentinel: ${hostname} (${alertType})`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
              .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 550px; margin: 0 auto; }
              .badge { background-color: #ef4444; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; display: inline-block; }
              .button { background-color: #10b981; color: #0f172a; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 24px; }
            </style>
          </head>
          <body>
            <div class="card">
              <span class="badge">Alerta Crítica</span>
              <h2 style="color: #ffffff; margin-top: 16px;">Atención requerida en ${hostname}</h2>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                Se ha detectado un evento térmico o de hardware en tu equipo monitoreado por <strong>PC Sentinel</strong>.
              </p>

              <div style="background-color: #0f172a; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #f8fafc;">${alertType}</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">${detailsMessage}</p>
              </div>

              <p style="color: #94a3b8; font-size: 13px;">
                Puedes ingresar a tu Dashboard para ejecutar la remediación remota en 1-Clic o revisar el diagnóstico detallado.
              </p>

              <a href="http://localhost:3000/dashboard" class="button">
                Abrir Dashboard y Remediar
              </a>

              <hr style="border: 0; border-top: 1px solid #334155; margin-top: 32px;" />
              <p style="font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0;">
                PC Sentinel • Monitoreo, Protección y Rendimiento
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Email de alerta enviado a ${toEmail} para el equipo ${hostname}`);
  } catch (err) {
    console.error("Error enviando email transaccional con Resend:", err);
  }
}