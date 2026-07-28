"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  LayoutDashboard, 
  Monitor, 
  Bell, 
  FileText, 
  Settings 
} from "lucide-react";

const navigation = [
  { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { name: "Equipos", href: "/dashboard/equipos", icon: Monitor },
  { name: "Alertas", href: "/dashboard/alertas", icon: Bell },
  { name: "Reportes", href: "/dashboard/reportes", icon: FileText },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sentinel-dark text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      
      {/* Brand Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-sentinel-emerald">
          <Shield className="w-5 h-5" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">
          PC <span className="text-sentinel-emerald">Sentinel</span>
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
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

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">PC Sentinel Agent v1.0</p>
        <p className="mt-0.5">Sistemas monitoreados activos</p>
      </div>

    </aside>
  );
}