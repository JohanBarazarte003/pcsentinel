import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "¿Cómo se instala PC Sentinel en mi computadora?",
    a: "Es extremadamente sencillo. Al registrarte, descargas el ejecutable preconfigurado de 1-Clic (.exe). Solo haces doble clic y se instalará silenciosamente en segundo plano sin pedir configuraciones complejas.",
  },
  {
    q: "¿El agente de PC Sentinel ralentiza mi computadora o juegos?",
    a: "No. Nuestro agente está escrito en Python compilado a código nativo ultra-eficiente. Consume menos de 25 MB de memoria RAM y el uso de CPU es inferior al 0.01%.",
  },
  {
    q: "¿Puedo usarlo para mi empresa y monitorear las laptops de mis empleados?",
    a: "Sí. Las cuentas de tipo Empresa (B2B) te permiten generar un comando de instalación para desplegar el agente en masa en decenas de computadoras simultáneamente.",
  },
  {
    q: "¿Mis datos y métricas están seguros?",
    a: "Totalmente. Utilizamos encriptación HTTPS para el envío de telemetría y aislamiento de datos a nivel de base de datos con Row Level Security (RLS) en PostgreSQL.",
  },
];

export function FAQ() {
  return (
    <section id="documentacion" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-sentinel-emerald">
            <HelpCircle className="w-4 h-4" />
            <span>Soporte & Documentación</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-3">
                <span className="text-sentinel-emerald font-mono">0{index + 1}.</span>
                {faq.q}
              </h3>
              <p className="text-slate-400 text-sm pl-7 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}