"use client";

import { useState } from "react";
import { Copy, Check, X, ShieldCheck, QrCode } from "lucide-react";

interface BinancePayModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  binancePayId: string;
}

export function BinancePayModal({
  isOpen,
  onClose,
  planName,
  amount,
  binancePayId,
}: BinancePayModalProps) {
  const [copied, setCopied] = useState(false);
  const [txId, setTxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const copyPayId = () => {
    navigator.clipboard.writeText(binancePayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setTxId("");
      }, 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pago con Binance Pay (USDT)</h3>
            <p className="text-xs text-slate-400">{planName}</p>
          </div>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-sentinel-emerald mx-auto" />
            <h4 className="text-base font-bold text-white">¡Pago Confirmado!</h4>
            <p className="text-xs text-slate-300">Tu suscripción ha sido actualizada exitosamente.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Monto a Pagar */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Monto a Transferir:</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">{amount} USDT</span>
            </div>

            {/* Binance Pay ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Binance Pay ID / UID Oficial
              </label>
              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-sm text-white flex items-center justify-between">
                <span>{binancePayId}</span>
                <button
                  onClick={copyPayId}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-sans font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copiado" : "Copiar ID"}</span>
                </button>
              </div>
            </div>

            {/* Formulario ID Transacción */}
            <form onSubmit={handleConfirmPayment} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  ID de Transacción / Orden Binance
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 24819203829103"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-95 text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Verificando Transacción..." : "Confirmar Pago en USDT"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default BinancePayModal; 