"use client";

import { useState } from "react";
import { Sparkles, ShieldCheck, Cpu, Layers } from "lucide-react";

interface DeviceDetailTabsProps {
  remediationComponent: React.ReactNode;
  softwareComponent: React.ReactNode;
  hardwareComponent: React.ReactNode;
}

export function DeviceDetailTabs({
  remediationComponent,
  softwareComponent,
  hardwareComponent,
}: DeviceDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "remediation" | "software" | "hardware">("all");

  return (
    <div className="space-y-6">
      
      {/* Pestañas de Navegación Pegajosas (Sticky Nav Tabs) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex flex-wrap gap-2 sticky top-0 sm:top-4 z-30 backdrop-blur-md bg-white/95">
        
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-transparent text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4 text-sentinel-emerald" />
          <span>Ver Diagnóstico Completo</span>
        </button>

        <button
          onClick={() => setActiveTab("remediation")}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "remediation"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-transparent text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-sentinel-emerald" />
          <span>Remediación en 1-Clic</span>
        </button>

        <button
          onClick={() => setActiveTab("software")}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "software"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-transparent text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Software & Seguridad</span>
        </button>

        <button
          onClick={() => setActiveTab("hardware")}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "hardware"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-transparent text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Cpu className="w-4 h-4 text-blue-500" />
          <span>Ficha Técnica de Hardware</span>
        </button>

      </div>

      {/* Renderizado Dinámico de Secciones */}
      {(activeTab === "all" || activeTab === "remediation") && (
        <div className="animate-in fade-in duration-200">{remediationComponent}</div>
      )}

      {(activeTab === "all" || activeTab === "software") && (
        <div className="animate-in fade-in duration-200">{softwareComponent}</div>
      )}

      {(activeTab === "all" || activeTab === "hardware") && (
        <div className="animate-in fade-in duration-200">{hardwareComponent}</div>
      )}

    </div>
  );
}