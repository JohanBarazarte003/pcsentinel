"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

interface AdminPlanSwitcherProps {
  orgId: string;
  currentType: string;
}

export function AdminPlanSwitcher({ orgId, currentType }: AdminPlanSwitcherProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdatePlan = async (newType: string) => {
    if (newType === currentType) return;
    
    if (!confirm(`¿Confirmas cambiar el plan de esta organización a '${newType.toUpperCase()}'?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/plans/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetOrgId: orgId, newAccountType: newType }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Error actualizando plan.");
      }
    } catch (err) {
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-sentinel-emerald" />
      ) : (
        <select
          value={currentType}
          onChange={(e) => handleUpdatePlan(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-sentinel-emerald cursor-pointer"
        >
          <option value="personal">Gratis (Personal)</option>
          <option value="pro">Pro ($4.99 USDT)</option>
          <option value="business">Empresa ($29.00 USDT)</option>
        </select>
      )}
    </div>
  );
}