"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Shield } from "lucide-react";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="precios" className="py-24 bg-sentinel-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-xs font-bold text-sentinel-emerald uppercase tracking-widest">
            Planes Transparentes
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Elige el plan ideal para tus equipos
          </p>
          <p className="text-slate-400 text-base">
            Comienza totalmente gratis. Escala según tus necesidades individuales o de empresa.
          </p>

          {/* Toggle Anual / Mensual */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${!isAnnual ? "text-white" : "text-slate-400"}`}>
              Facturación Mensual
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 rounded-full bg-slate-800 border border-slate-700 p-1 flex items-center transition-colors relative"
            >
              <div
                className={`w-4 h-4 rounded-full bg-sentinel-emerald transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${isAnnual ? "text-white" : "text-slate-400"} flex items-center gap-1.5`}>
              Facturación Anual
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-sentinel-emerald text-[10px] font-bold">
                Ahorra 20%
              </span>
            </span>
          </div>
        </div>

        {/* Grid de 3 Tarjetas de Precios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan Gratis (B2C) */}
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Starter</span>
              <h3 className="text-2xl font-bold text-white mt-1">Gratis para siempre</h3>
              <p className="text-xs text-slate-400 mt-2">Para usuarios individuales que desean probar el servicio.</p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-400 text-xs font-medium ml-1">/ mes</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>1 Computadora Monitoreada</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Métricas de CPU y RAM en Vivo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Agente Silencioso para Windows</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs text-center transition-colors block"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Plan Pro Gamer / Freelancer (B2C Destacado) */}
          <div className="p-8 rounded-2xl bg-slate-900 border-2 border-sentinel-emerald flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sentinel-emerald text-slate-950 font-extrabold text-[10px] tracking-wider uppercase">
              Más Popular
            </div>

            <div>
              <span className="text-xs font-bold text-sentinel-emerald uppercase tracking-wider">Pro Personal</span>
              <h3 className="text-2xl font-bold text-white mt-1">Gamer & Freelancer</h3>
              <p className="text-xs text-slate-400 mt-2">Monitoreo térmico avanzado y protección de SSD.</p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">
                  {isAnnual ? "$3.99" : "$4.99"}
                </span>
                <span className="text-slate-400 text-xs font-medium ml-1">/ mes</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Hasta 3 Computadoras</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Sensor de Temperatura de CPU y GPU</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Alarma de Desgaste de Disco SSD</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Historial de Rendimiento de 30 días</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full py-3 rounded-xl bg-sentinel-emerald hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center transition-all shadow-lg shadow-emerald-500/20 block"
            >
              Obtener Plan Pro
            </Link>
          </div>

          {/* Plan Empresa (B2B) */}
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Empresas & Pymes</span>
              <h3 className="text-2xl font-bold text-white mt-1">Flotas de TI</h3>
              <p className="text-xs text-slate-400 mt-2">Para agencias que gestionan múltiples computadoras.</p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">
                  {isAnnual ? "$24.00" : "$29.00"}
                </span>
                <span className="text-slate-400 text-xs font-medium ml-1">/ mes</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Hasta 15 Computadoras</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Gestión por Departamentos y Equipos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Diagnóstico de Drivers Corruptos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sentinel-emerald shrink-0" />
                  <span>Generador de Reportes de Salud en PDF</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs text-center transition-colors block"
            >
              Comenzar Prueba Empresa
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}