"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddDeviceModal } from "@/components/dashboard/AddDeviceModal/AddDeviceModal";

interface DashboardHeaderProps {
  orgName: string;
  orgId: string;
  isLimitReached?: boolean;
}

export function DashboardHeader({ orgName, orgId, isLimitReached = false }: DashboardHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resumen</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organización: <span className="font-semibold text-slate-700">{orgName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex text-xs font-semibold px-3 py-2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Servicio Activo
          </span>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-sentinel-emerald hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Vincular Computadora</span>
          </button>
        </div>
      </div>

      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orgId={orgId}
        isLimitReached={isLimitReached}
      />
    </>
  );
}

export default DashboardHeader;