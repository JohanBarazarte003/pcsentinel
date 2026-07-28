import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FileText, Download, CheckCircle2, Shield } from "lucide-react";

export default async function ReportesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("owner_id", user?.id)
    .single();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-sentinel-light text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Reportes de Salud</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Genera informes técnicos ejecutivos para <strong className="text-slate-700">{organization?.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Reporte Mensual */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Informe Mensual de Rendimiento</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Resumen de estabilidad, tiempo de actividad y picos de temperatura de tus equipos durante los últimos 30 días.
              </p>
            </div>

            <button className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4 text-sentinel-emerald" />
              <span>Exportar PDF Resumen</span>
            </button>
          </div>

          {/* Card Inventario de Hardware */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Inventario de Hardware y Drivers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ficha técnica detallada de procesadores, memoria RAM instalada y salud de discos SSD de toda la flota.
              </p>
            </div>

            <button className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Exportar CSV de Flota</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}