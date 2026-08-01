import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AdminPlanSwitcher } from "@/components/admin/AdminPlanSwitcher/AdminPlanSwitcher";
import { 
  Users, 
  DollarSign, 
  Monitor, 
  ShieldAlert, 
  ArrowLeft, 
  Building
} from "lucide-react";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Verificar si el usuario en sesión es Super Admin
  const { data: userOrg } = await supabaseAdmin
    .from("organizations")
    .select("is_super_admin")
    .eq("owner_id", user.id)
    .single();

  if (!userOrg?.is_super_admin) {
    redirect("/dashboard"); // Expulsar si no tiene permiso de Super Admin
  }

  // 2. Consultar Métricas Globales del SaaS
  const { data: allOrgs } = await supabaseAdmin
    .from("organizations")
    .select("*, devices(id, hostname, status)")
    .order("created_at", { ascending: false });

  const { count: totalDevicesCount } = await supabaseAdmin
    .from("devices")
    .select("id", { count: "exact", head: true });

  const { count: totalAlertsCount } = await supabaseAdmin
    .from("alerts")
    .select("id", { count: "exact", head: true });

  const totalUsers = allOrgs?.length || 0;
  
  // Cálculo de MRR Estimado en USDT
  let mrrUsdt = 0;
  let proCount = 0;
  let businessCount = 0;

  allOrgs?.forEach((org) => {
    if (org.account_type === "pro") {
      mrrUsdt += 4.99;
      proCount++;
    } else if (org.account_type === "business") {
      mrrUsdt += 29.00;
      businessCount++;
    }
  });

  return (
    <div className="min-h-screen bg-sentinel-dark text-slate-100 flex flex-col">
      
      {/* Header Admin */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Logo showTagline={false} />
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Super Admin Control
          </span>
        </div>

        <Link 
          href="/dashboard" 
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Dashboard de Usuario</span>
        </Link>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Panel Ejecutivo de Control</h1>
          <p className="text-xs text-slate-400 mt-1">Supervisión general de ingresos, usuarios y estado global de la infraestructura</p>
        </div>

        {/* 4 Cards de Métricas Ejecutivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* MRR Estimado */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">MRR Recurrente</p>
                <h3 className="text-3xl font-black text-amber-400 mt-1">${mrrUsdt.toFixed(2)} <span className="text-xs font-normal text-slate-400">USDT/mo</span></h3>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">{proCount} Pro ($4.99) | {businessCount} Empresa ($29)</p>
          </div>

          {/* Clientes Totales */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Totales</p>
                <h3 className="text-3xl font-black text-white mt-1">{totalUsers}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Cuentas registradas activas</p>
          </div>

          {/* PCs Totales Monitoreadas */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PCs en la Nube</p>
                <h3 className="text-3xl font-black text-sentinel-emerald mt-1">{totalDevicesCount || 0}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-sentinel-emerald rounded-xl">
                <Monitor className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Equipos vinculados globales</p>
          </div>

          {/* Alertas Críticas Globales (Variable Corregida) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas Globales</p>
                <h3 className="text-3xl font-black text-rose-400 mt-1">{totalAlertsCount || 0}</h3>
              </div>
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Eventos de hardware registrados</p>
          </div>

        </div>

        {/* Tabla CRM de Usuarios */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-sentinel-emerald" />
                Gestión de Clientes y Activación de Planes
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cambia manualmente el plan de un cliente tras recibir su pago por Binance Pay.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Organización / Cliente</th>
                  <th className="px-6 py-4">Suscripción Activa</th>
                  <th className="px-6 py-4">PCs Conectadas</th>
                  <th className="px-6 py-4">Fecha Registro</th>
                  <th className="px-6 py-4 text-right">Gestión de Plan (Binance Pay)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {allOrgs && allOrgs.length > 0 ? (
                  allOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        {org.name}
                        {org.is_super_admin && (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30">Admin</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {org.account_type === "business" ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">Empresa ($29)</span>
                        ) : org.account_type === "pro" ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">Pro ($4.99)</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Gratis (1 PC)</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-white">
                        {org.devices?.length || 0} equipos
                      </td>

                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <AdminPlanSwitcher orgId={org.id} currentType={org.account_type || "personal"} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No hay clientes registrados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}