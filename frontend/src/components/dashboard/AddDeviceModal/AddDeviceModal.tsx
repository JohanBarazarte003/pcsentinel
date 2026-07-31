"use client";

import { useState } from "react";
import { Download, Monitor, Copy, Check, Terminal, X, ShieldAlert, QrCode } from "lucide-react";
import BinancePayModal from "@/components/dashboard/BinancePayModal/BinancePayModal";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  isLimitReached?: boolean;
}

export function AddDeviceModal({
  isOpen,
  onClose,
  orgId,
  isLimitReached = false,
}: AddDeviceModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"exe" | "cli">("exe");
  const [deviceKey] = useState(() => `STN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
  const [isBinanceModalOpen, setIsBinanceModalOpen] = useState(false);

  if (!isOpen) return null;

  const downloadUrl = `/api/v1/download/installer?key=${deviceKey}&org_id=${orgId}`;
  const powerShellCommand = `irm https://pcsentinel.io/install.ps1 | iex -DeviceKey "${deviceKey}"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(powerShellCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
          
          {/* Botón Cerrar */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* CASO A: LÍMITE DEL PLAN ALCANZADO (MOSTRAR ALERTA DE UPGRADE Y BOTÓN DE PAGO) */}
          {isLimitReached ? (
            <div className="space-y-6 text-center py-2">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl w-fit mx-auto">
                <ShieldAlert className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Límite de Equipos Alcanzado</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Has alcanzado el límite de <strong>1 computadora permitida</strong> en tu plan de uso personal gratuito.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                <p className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Recomendación de Actualización:</p>
                <p className="text-slate-300 leading-relaxed">
                  Actualiza a un <strong>Plan Pro ($4.99 USDT)</strong> o <strong>Plan Empresa ($29.00 USDT)</strong> para vincular computadoras ilimitadas y habilitar reportes ejecutivos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => setIsBinanceModalOpen(true)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <QrCode className="w-4 h-4 stroke-[2.5]" />
                  <span>Actualizar Plan con Binance Pay</span>
                </button>
              </div>
            </div>
          ) : (
            /* CASO B: MODAL NORMAL DE VINCULACIÓN SI TIENE CUPO */
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-sentinel-emerald rounded-xl">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Vincular Nueva Computadora</h3>
                  <p className="text-xs text-slate-400">Instala PC Sentinel en cualquier laptop o PC con Windows</p>
                </div>
              </div>

              <div className="flex border-b border-slate-800 mb-6">
                <button
                  onClick={() => setActiveTab("exe")}
                  className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === "exe"
                      ? "border-sentinel-emerald text-sentinel-emerald"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Instalador Directo (.EXE) - Recomendado
                </button>
                <button
                  onClick={() => setActiveTab("cli")}
                  className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === "cli"
                      ? "border-sentinel-emerald text-sentinel-emerald"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Administradores TI (PowerShell)
                </button>
              </div>

              {activeTab === "exe" ? (
                <div className="space-y-6 text-center py-4">
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                    <Download className="w-12 h-12 text-sentinel-emerald mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Descargar Instalador de Windows</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                        Descarga el ejecutable preconfigurado. Solo debes hacer doble clic para comenzar a monitorear.
                      </p>
                    </div>

                    <a
                      href={downloadUrl}
                      download={`PCSentinel_Setup_${deviceKey}.exe`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sentinel-emerald hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Descargar PCSentinel_Setup_{deviceKey}.exe</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-sentinel-emerald" />
                      Comando para Despliegue Remoto
                    </label>

                    <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 flex items-center justify-between gap-4">
                      <span className="truncate">{powerShellCommand}</span>
                      <button
                        onClick={copyToClipboard}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-sans font-medium transition-colors shrink-0"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal Binance Pay Emergente */}
      {isBinanceModalOpen && (
        <BinancePayModal
          isOpen={isBinanceModalOpen}
          onClose={() => setIsBinanceModalOpen(false)}
          planName="Plan Pro Multidispositivo"
          amount={4.99}
          binancePayId={process.env.NEXT_PUBLIC_BINANCE_PAY_ID || "248192038"}
        />
      )}
    </>
  );
}

export default AddDeviceModal;