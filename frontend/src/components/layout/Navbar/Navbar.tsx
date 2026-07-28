"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-slate-800 bg-sentinel-dark/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo Oficial */}
        <Logo />

        {/* Navegación Desktop (Oculta en Móviles) */}
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

        {/* Botones Desktop (Ocultos en Móviles) */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">
            Login
          </Link>
          <Link href="/register" className="text-sm font-semibold text-slate-900 bg-sentinel-emerald hover:bg-emerald-400 px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            Comenzar gratis
          </Link>
        </div>

        {/* Botón Hamburgo Móvil (Visible solo en md:hidden) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 focus:outline-none"
          aria-label="Abrir Menú"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-sentinel-emerald" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <Link
              href="#caracteristicas"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sentinel-emerald py-2 border-b border-slate-800/60"
            >
              Características
            </Link>
            <Link
              href="#precios"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sentinel-emerald py-2 border-b border-slate-800/60"
            >
              Precios
            </Link>
            <Link
              href="#documentacion"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sentinel-emerald py-2 border-b border-slate-800/60"
            >
              Documentación
            </Link>
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-slate-300 bg-slate-800 rounded-xl border border-slate-700"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 text-sm font-bold text-slate-950 bg-sentinel-emerald hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}