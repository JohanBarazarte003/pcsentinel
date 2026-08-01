import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { User, QrCode } from "lucide-react";
import CheckoutButton from "@/components/dashboard/CheckoutButton/CheckoutButton";
import ChangePasswordForm from "@/components/dashboard/ChangePasswordForm/ChangePasswordForm";

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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Configuración y Planes</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Administra tu cuenta y suscripción activa de PC Sentinel</p>
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


           <ChangePasswordForm />

          {/* Card Suscripción & Pagos Binance Pay */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                Suscripción y Pagos (Binance Pay / USDT)
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Plan Actual: {organization?.account_type === "business" ? "Empresa" : "Gratis / Personal"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Botón Upgrade Pro */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Plan Pro Personal ($4.99 USDT/mes)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Monitoreo térmico acelerado para hasta 3 computadoras personales.
                  </p>
                </div>
                <CheckoutButton planType="pro" label="Pagar con Binance Pay ($4.99 USDT)" />
              </div>

              {/* Botón Upgrade Empresa */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Plan Empresa ($29.00 USDT/mes)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Para agencias y Pymes. Monitoreo de hasta 15 laptops + reportes de flota.
                  </p>
                </div>
                <CheckoutButton planType="business" label="Pagar con Binance Pay ($29 USDT)" />
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}