import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { 
  Monitor, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  // 1. Obtener el usuario autenticado actual
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Obtener la organización perteneciente a este usuario
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user?.id)
    .single();

  const orgId = organization?.id || "";
  const orgName = organization?.name || "Mi Organización";

  // 3. Consultar las computadoras registradas bajo esta organización
  const { data: devices } = await supabase
    .from("devices")
    .select("*, telemetry_logs(cpu_percent, ram_percent, cpu_temp, created_at)")
    .eq("org_id", orgId)
    .order("last_seen", { ascending: false });

  // Métricas dinámicas para las tarjetas de resumen
  const totalDevices = devices?.length || 0;
  const onlineDevices = devices?.filter(d => d.status === "online").length || 0;
  const warningDevices = devices?.filter(d => d.status === "warning" || d.status === "critical").length || 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-sentinel-light text-slate-800">
      
      {/* Sidebar Navegación (Mobile-First: Drawer en móvil, Barra lateral fija en desktop) */}
      <Sidebar />

      {/* Área Principal de Contenido Responsiva */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        
        {/* Header Dinámico con el Botón de Vincular Computadora */}
        <DashboardHeader orgName={orgName} orgId={orgId} />

        {/* 4 Tarjetas de Estadísticas Principales (1 columna en móvil, 2 en tablet, 4 en PC) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          
          {/* Card 1: Equipos en Línea */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipos en línea</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {onlineDevices} <span className="text-sm font-normal text-slate-400">de {totalDevices}</span>
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Monitor className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-4">
              <ArrowUpRight className="w-4 h-4" />
              <span>Sistemas activos y respondiendo</span>
            </div>
          </div>

          {/* Card 2: Alertas Críticas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alertas críticas</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {warningDevices} <span className="text-sm font-normal text-slate-400">de {totalDevices}</span>
                </h3>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-rose-600 mt-4">
              <ArrowDownRight className="w-4 h-4" />
              <span>Equipos con advertencias</span>
            </div>
          </div>

          {/* Card 3: Rendimiento Promedio */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rendimiento promedio</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">78%</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-4">
              <ArrowUpRight className="w-4 h-4" />
              <span>Carga de trabajo óptima</span>
            </div>
          </div>

          {/* Card 4: Tiempo de Actividad */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiempo de actividad</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">99.6%</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-4">
              <ArrowUpRight className="w-4 h-4" />
              <span>Estabilidad del servicio</span>
            </div>
          </div>

        </div>

        {/* Sección Inferior: Tabla de Equipos y Widget de Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Tabla de Equipos Monitoreados (8 Columnas en Desktop) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Estado de los equipos</h2>
              <span className="text-xs text-slate-400 font-medium">Actualizado en tiempo real</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3.5">Equipo</th>
                    <th className="px-4 sm:px-6 py-3.5">Estado</th>
                    <th className="px-4 sm:px-6 py-3.5">CPU</th>
                    <th className="px-4 sm:px-6 py-3.5">Memoria</th>
                    <th className="px-4 sm:px-6 py-3.5">Temperatura</th>
                    <th className="px-4 sm:px-6 py-3.5">Última Actividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {devices && devices.length > 0 ? (
                    devices.map((device) => {
                      const latestMetric = device.telemetry_logs?.[0] || { cpu_percent: 0, ram_percent: 0, cpu_temp: 0 };
                      
                      return (
                        <tr key={device.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900 flex items-center gap-2.5">
                            <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[140px] sm:max-w-none">{device.hostname}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            {device.status === "online" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                En línea
                              </span>
                            ) : device.status === "offline" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Pendiente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                Alerta
                              </span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 font-medium">{latestMetric.cpu_percent}%</td>
                          <td className="px-4 sm:px-6 py-4 font-medium">{latestMetric.ram_percent}%</td>
                          <td className="px-4 sm:px-6 py-4 font-medium">{latestMetric.cpu_temp ? `${latestMetric.cpu_temp}°C` : "N/A"}</td>
                          <td className="px-4 sm:px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(device.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                        No hay computadoras vinculadas a <strong className="text-slate-700">{orgName}</strong>.<br />
                        Haz clic en <strong className="text-sentinel-emerald">"+ Vincular Computadora"</strong> para conectar tu primer equipo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Widget Lateral de Alertas (4 Columnas en Desktop) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-900">Alertas del sistema</h2>
                <span className="text-xs font-semibold text-slate-400">Filtrado por org</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center py-8">
                  No hay alertas críticas en esta organización.
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-400 font-medium">
                Monitoreo automático 24/7 activo
              </span>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}