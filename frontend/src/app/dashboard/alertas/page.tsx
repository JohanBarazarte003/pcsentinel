import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Bell, AlertTriangle, ShieldCheck } from "lucide-react";

export default async function AlertasPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*, devices(hostname)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-sentinel-light text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Centro de Alertas</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Notificaciones de rendimiento y hardware en tiempo real</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-sentinel-emerald shrink-0" />
              Histórico de Notificaciones
            </h2>
          </div>

          {alerts && alerts.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex flex-col sm:flex-row items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="p-2.5 bg-rose-100 text-rose-600 rounded-lg shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{alert.type}</h4>
                      <span className="text-[11px] text-slate-400">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-2">Equipo: {alert.devices?.hostname}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 space-y-3">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">¡Sistemas 100% Saludables!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No se han detectado temperaturas críticas ni errores de hardware.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}