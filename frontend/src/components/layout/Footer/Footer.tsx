import Link from "next/link";
import { Shield, Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-sentinel-dark border-t border-slate-800 py-12 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-sentinel-emerald">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-white">
            PC <span className="text-sentinel-emerald">Sentinel</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="#caracteristicas" className="hover:text-white transition-colors">Características</Link>
          <Link href="#precios" className="hover:text-white transition-colors">Precios</Link>
          <Link href="#documentacion" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link>
        </div>

        {/* Copyright */}
        <p>© {new Date().getFullYear()} PC Sentinel Inc. Todos los derechos reservados.</p>

      </div>
    </footer>
  );
}