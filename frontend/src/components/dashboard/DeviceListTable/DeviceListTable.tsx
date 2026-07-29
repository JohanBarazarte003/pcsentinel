"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Monitor, Trash2, Clock, ChevronRight } from "lucide-react";

interface DeviceListTableProps {
  initialDevices: any[];
}

export function DeviceListTable({ initialDevices }: DeviceListTableProps) {
  const router = useRouter();
  const [devices, setDevices] = useState(initialDevices);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUnlink = async (deviceId: string, hostname: string) => {
    if (!confirm(`¿Estás seguro de que deseas desvincular el equipo "${hostname}"?`)) {
      return;
    }

    setDeletingId(deviceId);

    try {
      const response = await fetch("/api/v1/devices/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      if (response.ok) {
        setDevices(devices.filter((d) => d.id !== deviceId));
        router.refresh();
      } else {
        alert("Error al desvincular el equipo.");
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* ================================================================= */}
      {/* VISTA MÓVIL (< 640px): Tarjetas Apiladas (Mobile-First Pattern)    */}
      {/* ================================================================= */}
      <div className="block sm:hidden space-y-3">
        {devices.length > 0 ? (
          devices.map((device) => {
            const metric = device.telemetry_logs?.[0] || { cpu_percent: 0, ram_percent: 0, disk_percent: 0 };

            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4"
              >
                {/* Header de la Tarjeta Móvil Cliqueable hacia Ficha Técnica */}
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/dashboard/equipos/${device.id}`}
                    className="flex items-center gap-3 group flex-1"
                  >
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 group-hover:bg-sentinel-emerald group-hover:text-slate-950 transition-colors">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-sentinel-emerald transition-colors flex items-center gap-1">
                        {device.hostname}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </h3>
                      <p className="text-xs text-slate-400 truncate max-w-[160px]">{device.os_info}</p>
                    </div>
                  </Link>

                  {device.status === "online" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      En línea
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pendiente
                    </span>
                  )}
                </div>

                {/* Métrica de Hardware Móvil */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">CPU</span>
                    <span className="font-bold text-slate-800">{metric.cpu_percent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">RAM</span>
                    <span className="font-bold text-slate-800">{metric.ram_percent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Disco</span>
                    <span className="font-bold text-slate-800">{metric.disk_percent}%</span>
                  </div>
                </div>

                {/* Footer Móvil con Botón de Acción */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]" suppressHydrationWarning>
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(device.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>

                  <button
                    onClick={() => handleUnlink(device.id, device.hostname)}
                    disabled={deletingId === device.id}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === device.id ? "Eliminando..." : "Desvincular"}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-200">
            No hay equipos registrados.
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* VISTA DESKTOP (≥ 640px): Tabla Tradicional                        */}
      {/* ================================================================= */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Lista de Dispositivos</h2>
          <span className="text-xs font-semibold text-slate-400">Total: {devices.length} equipos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Equipo / SO</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5">CPU</th>
                <th className="px-6 py-3.5">RAM</th>
                <th className="px-6 py-3.5">Disco</th>
                <th className="px-6 py-3.5">Última Conexión</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.length > 0 ? (
                devices.map((device) => {
                  const metric = device.telemetry_logs?.[0] || { cpu_percent: 0, ram_percent: 0, disk_percent: 0 };

                  return (
                    <tr key={device.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/equipos/${device.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-sentinel-emerald group-hover:text-slate-950 transition-colors">
                            <Monitor className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-sentinel-emerald transition-colors flex items-center gap-1">
                              {device.hostname}
                              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-slate-400">{device.os_info}</p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        {device.status === "online" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            En línea
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pendiente
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium">{metric.cpu_percent}%</td>
                      <td className="px-6 py-4 font-medium">{metric.ram_percent}%</td>
                      <td className="px-6 py-4 font-medium">{metric.disk_percent}%</td>

                      <td className="px-6 py-4 text-xs text-slate-400" suppressHydrationWarning>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(device.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUnlink(device.id, device.hostname)}
                          disabled={deletingId === device.id}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingId === device.id ? "Eliminando..." : "Desvincular"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No hay computadoras registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}