"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AutoRefreshProps {
  intervalMs?: number; // Tiempo de refresco automático en milisegundos
}

export function AutoRefresh({ intervalMs = 5000 }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh(); // Vuelve a consultar la base de datos en segundo plano sin recargar la pantalla
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null; // Componente invisible
}

export default AutoRefresh;