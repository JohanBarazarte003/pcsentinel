import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Monitor, 
  ArrowLeft, 
  Cpu, 
  HardDrive, 
  Activity, 
  Thermometer, 
  MemoryStick, 
  Layers, 
  ShieldCheck, 
  ShieldAlert,
  Clock,
  Trash2,
  Zap,
  Lock
} from "lucide-react";

interface DeviceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeviceDetailPage({ params }: DeviceDetailPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user?.id)
    .single();

  const { data: device } = await supabase
    .from("devices")
    .select("*, telemetry_logs(*)")
    .eq("id", id)
    .eq("org_id", organization?.id || "")
    .single();

  if (!device) {
    notFound();
  }

  const latestTelemetry = device.telemetry_logs?.[device.telemetry_logs.length - 1] || {};
  const specs = device.hardware_specs || {};

  const motherboard = specs.motherboard || { manufacturer: "LENOVO", model: "BaseBoard" };
  const cpu = specs.cpu || { name: "Procesador Intel/AMD", cores: 0, threads: 0 };
  const ram = specs.ram || { total_gb: 0, speed_mhz: 0, slots_used: 0, slots_total: 0 };
  const gpus = specs.gpus || [];
  const disksHealth = specs.disks_health || [];
  const junkFilesGb = specs.junk_files_gb || 0;
  const startupPrograms = specs.startup_programs || [];
  const topProcesses = specs.top_processes || [];
  const corruptedDrivers = specs.corrupted_drivers || [];
  const securityStatus = specs.security_status || { antivirus_name: "Windows Defender", antivirus_active: true, firewall_active: true };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-sentinel-light text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8">
        
        {/* Navegación Superior */}
        <div>
          <Link 
            href="/dashboard/equipos" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Lista de Equipos</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-slate-700">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{device.hostname}</h1>
                  {device.status === "online" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      En línea
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pendiente
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{device.os_info}</p>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm w-fit" suppressHydrationWarning>
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Última conexión: {new Date(device.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* 4 Cards de Sensores Térmicos y Rendimiento en Vivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temp. CPU</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {latestTelemetry.cpu_temp ? `${latestTelemetry.cpu_temp}°C` : "N/A"}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Thermometer className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">Límite alerta: 85°C</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temp. GPU</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {latestTelemetry.gpu_temp ? `${latestTelemetry.gpu_temp}°C` : "N/A"}
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Thermometer className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">Sensor Nvidia Activo</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uso de Memoria</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {latestTelemetry.ram_percent || 0}%
                </h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">De {ram.total_gb || 8} GB instalados</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Basura Liberable</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {junkFilesGb} <span className="text-sm font-normal text-slate-400">GB</span>
                </h3>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">Archivos %TEMP% acumulados</p>
          </div>

        </div>

        {/* SECCIÓN 1: SALUD DE SOFTWARE Y SEGURIDAD (FASE 2) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sentinel-emerald" />
              Diagnóstico de Software y Seguridad
            </h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Sistema Operativo & Procesos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Antivirus y Firewall */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Lock className="w-4 h-4 text-sentinel-emerald" />
                <span>Seguridad de Windows</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800">{securityStatus.antivirus_name}</span>
                  {securityStatus.antivirus_active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Activo</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Inactivo</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800">Firewall de Windows</span>
                  {securityStatus.firewall_active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Activo</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Inactivo</span>
                  )}
                </div>
              </div>
            </div>

            {/* Top 5 Procesos Consumidores */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-sentinel-emerald" />
                <span>Top Procesos Consumidores en Vivo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topProcesses.map((proc: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">{proc.name}</span>
                    <div className="flex gap-2 text-[11px]">
                      <span className="font-semibold text-blue-600">RAM: {proc.ram_pct}%</span>
                      <span className="font-semibold text-amber-600">CPU: {proc.cpu_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Programas de Inicio */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-sentinel-emerald" />
                <span>Programas de Inicio Automático</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {startupPrograms.map((prog: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <p className="font-bold text-slate-900 truncate">{prog.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{prog.path}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estado de Drivers */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-sentinel-emerald" />
                <span>Estado de Controladores</span>
              </div>
              {corruptedDrivers.length > 0 ? (
                <div className="space-y-1">
                  {corruptedDrivers.map((drv: any, idx: number) => (
                    <div key={idx} className="p-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                      {drv.name} (Código {drv.error_code})
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>0 Drivers Corruptos en Windows</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SECCIÓN 2: FICHA TÉCNICA VISUAL DE HARDWARE (FASE 1) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sentinel-emerald" />
              Ficha Técnica de Componentes
            </h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Inspección de Hardware
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Placa Madre */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-sentinel-emerald" />
                <span>Placa Madre</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{motherboard.manufacturer}</p>
              <p className="text-xs text-slate-500 font-mono">Modelo: {motherboard.model}</p>
            </div>

            {/* Procesador */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-sentinel-emerald" />
                <span>Procesador (CPU)</span>
              </div>
              <p className="text-sm font-bold text-slate-900 truncate">{cpu.name}</p>
              <p className="text-xs text-slate-500 font-medium">
                {cpu.cores} Núcleos Físicos | {cpu.threads} Hilos Lógicos
              </p>
            </div>

            {/* Memoria RAM */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <MemoryStick className="w-4 h-4 text-sentinel-emerald" />
                <span>Memoria RAM</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{ram.total_gb} GB Instalados</p>
              <p className="text-xs text-slate-500 font-medium">
                Frecuencia: {ram.speed_mhz} MHz | Slots: {ram.slots_used} de {ram.slots_total} ocupados
              </p>
            </div>

            {/* Tarjetas Gráficas */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Monitor className="w-4 h-4 text-sentinel-emerald" />
                <span>Tarjetas Gráficas (Dual GPU)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {gpus.map((gpu: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <p className="font-bold text-slate-900">{gpu.name}</p>
                    <p className="text-slate-400 font-mono mt-0.5">VRAM: {gpu.vram_gb} GB</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Discos SMART */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <HardDrive className="w-4 h-4 text-sentinel-emerald" />
                <span>Almacenamiento SMART</span>
              </div>
              <div className="space-y-2 pt-1">
                {disksHealth.map((d: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[150px]">{d.name}</p>
                      <p className="text-slate-400 font-medium text-[11px]">{d.type}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      {d.health}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}