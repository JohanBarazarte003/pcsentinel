"use client";

import { useState } from "react";
import { ShieldAlert, X, Loader2, Trash2 } from "lucide-react";

interface UnlinkDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  hostname: string;
}

export function UnlinkDeviceModal({
  isOpen,
  onClose,
  onConfirm,
  hostname,
}: UnlinkDeviceModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado de Advertencia Corporativa */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Desvincular Computadora</h3>
            <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Acción de Alta Seguridad</p>
          </div>
        </div>

        {/* Cuerpo de la Advertencia */}
        <div className="space-y-3 my-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            ¿Confirmas que deseas desvincular la computadora <strong className="text-white font-mono">{hostname}</strong> de tu organización?
          </p>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-bold text-slate-200 uppercase tracking-wider">Impacto de la desvinculación:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Se detendrá el monitoreo de temperatura en tiempo real.</li>
              <li>Se purgarán las alertas y el historial de telemetría.</li>
              <li>El agente en la PC cliente entrará en estado inactivo.</li>
            </ul>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{loading ? "Desvinculando..." : "Sí, Desvincular"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default UnlinkDeviceModal;