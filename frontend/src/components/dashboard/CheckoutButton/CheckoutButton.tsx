"use client";

import { useState } from "react";
import { QrCode, Loader2 } from "lucide-react";
import BinancePayModal from "@/components/dashboard/BinancePayModal/BinancePayModal";

interface CheckoutButtonProps {
  planType: "pro" | "business";
  label: string;
}

export function CheckoutButton({ planType, label }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payData, setPayData] = useState<{ amount: number; binancePayId: string; planName: string } | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/binance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const data = await response.json();

      if (data.success) {
        setPayData({
          amount: data.amount,
          binancePayId: data.binancePayId,
          planName: data.planName,
        });
        setIsModalOpen(true);
      } else {
        alert("Error iniciando pasarela Binance Pay.");
      }
    } catch (err) {
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <QrCode className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        )}
        <span>{loading ? "Procesando..." : label}</span>
      </button>

      {payData && (
        <BinancePayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planName={payData.planName}
          amount={payData.amount}
          binancePayId={payData.binancePayId}
        />
      )}
    </>
  );
}

export default CheckoutButton;