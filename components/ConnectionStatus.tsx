"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

export function ConnectionStatus() {
  const { isConnected, isCheckingConnection, checkConnection, ngrokUrl } =
    useAppStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!ngrokUrl) return;

    // Ping inicial
    checkConnection();

    // Polling cada 5 segundos
    intervalRef.current = setInterval(() => {
      checkConnection();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ngrokUrl, checkConnection]);

  const statusClass = isCheckingConnection
    ? "checking"
    : isConnected
      ? "connected"
      : "disconnected";

  const label = isCheckingConnection
    ? "Comprobando…"
    : isConnected
      ? "Conectado"
      : "Desconectado";

  return (
    <span className={`connection-badge ${statusClass}`}>
      <span className={`status-dot ${statusClass}`} />
      {label}
    </span>
  );
}
