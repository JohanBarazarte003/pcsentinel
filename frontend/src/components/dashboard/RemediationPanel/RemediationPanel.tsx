"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Lock, Wifi, Zap, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface RemediationPanelProps {
  deviceId: string;
  junkGb: number;
  firewallActive: boolean;
}

export function RemediationPanel({ deviceId, junkGb, firewallActive }: RemediationPanelProps) {
  const router = useRouter();
  const [loadingCmd, setLoadingCmd] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendRemediation = async (commandType: string, label: string) => {
    setLoadingCmd(commandType);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/v1/actions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, commandType }),
      });

      if (response.ok) {
        setSuccessMsg(`Orden "${label}" enviada a la PC. El agente la ejecutará en menos de 15 segundos.`);
        setTimeout(() => setSuccessMsg(null), 8000);
        router.refresh();
      } else {
        alert("Error enviando orden de remediación.");
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
    } finally {
      setLoadingCmd(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-sentinel-emerald rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Módulo de Remediación y Reparación en 1-Clic</h2>
            <p className="text-xs text-slate-400">Ejecuta soluciones técnicas remotas en tiempo real</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Asistencia Remota Activa
        </span>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Botón 1: Limpiar Basura */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
              <Trash2 className="w-4 h-4" />
              <span>Limpiar Archivos Temporales</span>
            </div>
            <p className="text-xs text-slate-500">
              Liberar {junkGb} GB de archivos basura acumulados en la carpeta %TEMP%.
            </p>
          </div>

          <button
            onClick={() => handleSendRemediation("CLEAN_TEMP", "Liberar Temporales")}
            disabled={loadingCmd !== null}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loadingCmd === "CLEAN_TEMP" ? (
              <Loader2 className="w-4 h-4 animate-spin text-sentinel-emerald" />
            ) : (
              <Trash2 className="w-4 h-4 text-sentinel-emerald" />
            )}
            <span>{loadingCmd === "CLEAN_TEMP" ? "Enviando Orden..." : "Liberar Espacio Ahora"}</span>
          </button>
        </div>

        {/* Botón 2: Activar Firewall */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>Activar Firewall de Windows</span>
            </div>
            <p className="text-xs text-slate-500">
              {firewallActive ? "El Firewall está activo y protegiendo." : "¡ATENCIÓN! El Firewall está inactivo. Re-actívalo a distancia."}
            </p>
          </div>

          <button
            onClick={() => handleSendRemediation("ENABLE_FIREWALL", "Activar Firewall")}
            disabled={loadingCmd !== null}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loadingCmd === "ENABLE_FIREWALL" ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Lock className="w-4 h-4 text-indigo-400" />
            )}
            <span>{loadingCmd === "ENABLE_FIREWALL" ? "Enviando Orden..." : "Activar Firewall Remoto"}</span>
          </button>
        </div>

        {/* Botón 3: Flush DNS */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
              <Wifi className="w-4 h-4" />
              <span>Optimizar Red (Flush DNS)</span>
            </div>
            <p className="text-xs text-slate-500">
              Vaciar la caché de resolución DNS si el internet o las páginas cargan lentas.
            </p>
          </div>

          <button
            onClick={() => handleSendRemediation("FLUSH_DNS", "Flush DNS")}
            disabled={loadingCmd !== null}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loadingCmd === "FLUSH_DNS" ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <Wifi className="w-4 h-4 text-blue-400" />
            )}
            <span>{loadingCmd === "FLUSH_DNS" ? "Enviando Orden..." : "Restablecer Caché DNS"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}