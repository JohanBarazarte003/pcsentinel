"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { 
  LayoutDashboard, 
  Monitor, 
  Bell, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

const navigation = [
  { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { name: "Equipos", href: "/dashboard/equipos", icon: Monitor },
  { name: "Alertas", href: "/dashboard/alertas", icon: Bell },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Header Superior Móvil (Solo visible en pantallas pequeñas < lg) */}
      <div className="lg:hidden w-full bg-sentinel-dark border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <Logo showTagline={false} />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
          aria-label="Abrir Menú"
        >
          {isOpen ? <X className="w-5 h-5 text-sentinel-emerald" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Lateral para Desktop + Drawer Deslizante para Móvil */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sentinel-dark text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shrink-0 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Encabezado */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800">
          <Logo showTagline={false} />
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800/90 text-white border border-slate-700/60"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-sentinel-emerald" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Cierre de Sesión */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>

          <div className="text-[11px] text-slate-500 px-1">
            <p className="font-semibold text-slate-400">PC Sentinel Agent v1.0</p>
            <p>Servicio Cloud Activo</p>
          </div>
        </div>
      </aside>

      {/* Fondo Oscuro Semi-transparente cuando el Menú Móvil está abierto */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}
    </>
  );
}