import { Cpu, HardDrive, ShieldAlert, Zap, Layers, Bell } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Monitoreo Térmico y CPU",
    description: "Detecta sobrecalentamiento en tiempo real antes de que afecte el rendimiento o la vida útil de tus procesadores.",
  },
  {
    icon: HardDrive,
    title: "Salud SMART de SSD/HDD",
    description: "Supervisa el desgaste de discos de estado sólido y previene la pérdida irrecuperable de archivos importantes.",
  },
  {
    icon: ShieldAlert,
    title: "Diagnóstico de Drivers",
    description: "Escanea errores del sistema (Código 43, Código 10) e identifica controladores corruptos u obsoletos.",
  },
  {
    icon: Zap,
    title: "Agente Ultra Liviano",
    description: "Ejecución silenciosa en segundo plano consumiendo menos de 25 MB de memoria RAM sin ralentizar tus juegos o trabajo.",
  },
  {
    icon: Layers,
    title: "Gestión B2C y Flotas B2B",
    description: "Aísla tus computadoras personales o gestiona docenas de laptops corporativas desde un único panel centralizado.",
  },
  {
    icon: Bell,
    title: "Alertas Automáticas",
    description: "Recibe notificaciones instantáneas ante cualquier pico de temperatura o fallo inminente de hardware.",
  },
];

export function Features() {
  return (
    <section id="caracteristicas" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Sección */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-sentinel-emerald uppercase tracking-widest">
            Diagnóstico de Hardware
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Todo lo que necesitas para mantener tus PCs al 100%
          </p>
          <p className="text-slate-400 text-base">
            Diseñado para prevenir fallos mecánicos y de software antes de que interrumpan tus jornadas.
          </p>
        </div>

        {/* Grid de 6 Tarjetas con Efecto Hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-sentinel-emerald/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sentinel-emerald group-hover:bg-sentinel-emerald group-hover:text-slate-950 transition-all duration-300 mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}