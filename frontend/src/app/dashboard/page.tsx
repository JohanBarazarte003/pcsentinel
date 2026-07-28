import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
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

  // 1. Consultar computadoras registradas en Supabase
  const { data: devices } = await supabase
    .from("devices")
    .select("*, telemetry_logs(cpu_percent, ram_percent, cpu_temp, created_at)")
    .order("last_seen", { ascending: false });

  // Métricas para los Stat Cards
  const totalDevices = devices?.length || 0;
  const onlineDevices = devices?.filter(d => d.status === "online").length || 0;
  const warningDevices = devices?.filter(d => d.status === "warning" || d.status === "critical").length || 0;

  return (
    <div className="flex min-h-screen bg-sentinel-light text-slate-800">
      
      {/* Sidebar Navegación Lateral (Modo Oscuro) */}
      <Sidebar />

      {/* Área Principal de Trabajo (Modo Claro / Limpio) */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header Superior */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resumen</h1>
            <p className="text-sm text-slate-500 mt-0.5">Estado general de tus equipos monitoreados</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Servicio de Alertas Activo
            </span>
          </div>
        </div>

        {/* 4 Cards de Resumen Principal (Stats Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
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
              <span>14% respecto a la semana pasada</span>
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
              <span>Atención requerida en 2 equipos</span>
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
              <span>8% optimización de carga</span>
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
              <span>0.4% estabilidad de red</span>
            </div>
          </div>

        </div>

        {/* Sección Inferior: Tabla de Estado de Equipos y Alertas Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Tabla de Equipos (8 Columnas) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Estado de los equipos</h2>
              <span className="text-xs text-slate-400 font-medium">Actualizado en tiempo real</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Equipo</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5">CPU</th>
                    <th className="px-6 py-3.5">Memoria</th>
                    <th className="px-6 py-3.5">Temperatura</th>
                    <th className="px-6 py-3.5">Última Actividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {devices && devices.length > 0 ? (
                    devices.map((device) => {
                      const latestMetric = device.telemetry_logs?.[0] || { cpu_percent: 0, ram_percent: 0, cpu_temp: 0 };
                      
                      return (
                        <tr key={device.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                            <Monitor className="w-4 h-4 text-slate-400" />
                            {device.hostname}
                          </td>
                          <td className="px-6 py-4">
                            {device.status === "online" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                En línea
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                Alerta
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium">{latestMetric.cpu_percent}%</td>
                          <td className="px-6 py-4 font-medium">{latestMetric.ram_percent}%</td>
                          <td className="px-6 py-4 font-medium">{latestMetric.cpu_temp ? `${latestMetric.cpu_temp}°C` : "N/A"}</td>
                          <td className="px-6 py-4 text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(device.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                        No hay equipos registrados aún. Ejecuta el Agente de Windows para vincular la primera PC.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Widget de Alertas Recientes (4 Columnas) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-900">Alertas recientes</h2>
                <button className="text-xs font-semibold text-sentinel-blue hover:underline">Ver todas</button>
              </div>

              <div className="space-y-4">
                
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Temperatura Alta</h4>
                    <p className="text-xs text-slate-500 mt-0.5">OFFICE-PC-01 alcanzó los 72°C en CPU</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Hace 5 min</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Uso de Disco Alto</h4>
                    <p className="text-xs text-slate-500 mt-0.5">LAPTOP-04K2LM está al 87% de capacidad</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Hace 15 min</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Actualización Disponible</h4>
                    <p className="text-xs text-slate-500 mt-0.5">DESKTOP-7G3H2K requiere driver Intel GPU</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Hace 1 hora</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-400 font-medium">
                Respuesta en tiempo real conectada a Supabase
              </span>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}