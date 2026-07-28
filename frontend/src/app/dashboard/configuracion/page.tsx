import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { User, Building, ShieldCheck } from "lucide-react";

export default async function ConfiguracionPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, account_type")
    .eq("owner_id", user?.id)
    .single();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-sentinel-light text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Configuración</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Administra tu perfil de usuario y la cuenta de organización</p>
        </div>

        <div className="max-w-3xl space-y-6">
          
          {/* Card Usuario */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-sentinel-emerald" />
              Perfil del Usuario
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  ID de Cuenta
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.id || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[11px] text-slate-500 font-mono truncate"
                />
              </div>
            </div>
          </div>

          {/* Card Organización */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-sentinel-emerald" />
              Datos de la Organización
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Nombre de Organización
                </label>
                <input
                  type="text"
                  disabled
                  value={organization?.name || "Mi Organización"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Suscripción
                </label>
                <span className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 w-full justify-between">
                  <span>{organization?.account_type === "business" ? "Cuenta Empresa (B2B)" : "Uso Personal (B2C)"}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}