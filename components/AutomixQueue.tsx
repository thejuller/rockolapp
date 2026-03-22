"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

export function AutomixQueue() {
  const { automixQueue, isLoadingQueue, refreshQueue, ngrokUrl } =
    useAppStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!ngrokUrl) return;

    refreshQueue();

    // Polling cada 3 segundos
    intervalRef.current = setInterval(() => {
      refreshQueue();
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ngrokUrl, refreshQueue]);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: "0.875rem 1rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3>Cola Automix</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isLoadingQueue && <span className="spinner" />}
          <button
            className="btn btn-icon"
            onClick={() => refreshQueue()}
            title="Refrescar cola"
          >
            ↻
          </button>
        </div>
      </div>

      {automixQueue.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>La cola está vacía</p>
          <p
            style={{
              fontSize: "0.8125rem",
              marginTop: "0.375rem",
              color: "var(--text-muted)",
            }}
          >
            Busca una canción y añádela con el botón ＋
          </p>
        </div>
      ) : (
        <div
          style={{
            maxHeight: "calc(100dvh - 260px)",
            overflowY: "auto",
          }}
        >
          <AnimatePresence mode="popLayout">
            {automixQueue.map((track, i) => (
              <motion.div
                key={track.id}
                className="queue-item"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
              >
                <span className="queue-number">{i + 1}</span>
                <div className="track-info">
                  <div className="track-title">{track.title}</div>
                  {track.artist && (
                    <div className="track-artist">{track.artist}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
