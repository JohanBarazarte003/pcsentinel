"use client";

import { useState } from "react";
import { Monitor, Copy, Check, Terminal, X, ShieldAlert } from "lucide-react";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export function AddDeviceModal({ isOpen, onClose, orgId }: AddDeviceModalProps) {
  const [copied, setCopied] = useState(false);
  const [deviceKey] = useState(() => `STN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);

  if (!isOpen) return null;

  // Comando PowerShell de 1-Click que descarga y ejecuta el Agente vinculado a la clave única
  const powerShellCommand = `irm https://pcsentinel.io/install.ps1 | iex -DeviceKey "${deviceKey}"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(powerShellCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-sentinel-emerald rounded-xl">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Vincular Nueva Computadora</h3>
            <p className="text-xs text-slate-400">Instala el agente liviano de PC Sentinel en tu equipo Windows</p>
          </div>
        </div>

        {/* PowerShell 1-Click Command Box */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sentinel-emerald" />
              Comando de Instalación Rápida (PowerShell)
            </label>

            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 flex items-center justify-between gap-4">
              <span className="truncate">{powerShellCommand}</span>
              <button
                onClick={copyToClipboard}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-sans font-medium transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions List */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs text-slate-400">
            <p className="font-semibold text-slate-200">Instrucciones paso a paso:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abre <strong>PowerShell</strong> en tu laptop o PC con Windows.</li>
              <li>Pega el comando copiado arriba y presiona <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">Enter</kbd>.</li>
              <li>El agente se instalará silenciosamente en segundo plano (&lt;25 MB RAM).</li>
              <li>Tu equipo aparecerá automáticamente en el Dashboard en menos de 60 segundos.</li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
            <span>La clave temporal de vinculación es única y vencerá en 24 horas.</span>
          </div>
        </div>

      </div>
    </div>
  );
}