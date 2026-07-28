import Link from "next/link";
import { Shield, Activity } from "lucide-react";

export function Navbar() {
  return (
    <header className="w-full border-b border-slate-800 bg-sentinel-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-sentinel-emerald group-hover:border-sentinel-emerald transition-colors">
            <Shield className="w-6 h-6 absolute" />
            <Activity className="w-4 h-4 text-sentinel-emerald z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              PC <span className="text-sentinel-emerald">Sentinel</span>
            </span>
            <span className="text-[9px] tracking-widest text-sentinel-slate font-medium uppercase">
              Monitoreo • Protección
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#caracteristicas" className="hover:text-sentinel-emerald transition-colors">
            Características
          </Link>
          <Link href="#precios" className="hover:text-sentinel-emerald transition-colors">
            Precios
          </Link>
          <Link href="#documentacion" className="hover:text-sentinel-emerald transition-colors">
            Documentación
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-slate-900 bg-sentinel-emerald hover:bg-emerald-400 px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            Comenzar gratis
          </Link>
        </div>

      </div>
    </header>
  );
}