import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DeviceListTable } from "@/components/dashboard/DeviceListTable/DeviceListTable";

export default async function EquiposPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user?.id)
    .single();

  const { data: devices } = await supabase
    .from("devices")
    .select("*, telemetry_logs(cpu_percent, ram_percent, disk_percent, cpu_temp, created_at)")
    .eq("org_id", organization?.id || "")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-sentinel-light text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Gestión de Equipos</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administra la flota de computadoras de <strong className="text-slate-700">{organization?.name || "Mi Organización"}</strong>
          </p>
        </div>

        {/* Componente Responsivo de Lista y Desvinculación */}
        <DeviceListTable initialDevices={devices || []} />
      </main>
    </div>
  );
}