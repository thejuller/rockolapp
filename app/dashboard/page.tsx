"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { SearchBar } from "@/components/SearchBar";
import { TrackCard } from "@/components/TrackCard";
import { AutomixQueue } from "@/components/AutomixQueue";

export default function DashboardPage() {
  const router = useRouter();
  const {
    ngrokUrl,
    searchResults,
    loadConnectionFromStorage,
  } = useAppStore();

  useEffect(() => {
    loadConnectionFromStorage();
  }, [loadConnectionFromStorage]);

  useEffect(() => {
    if (!ngrokUrl) {
      router.replace("/setup");
    }
  }, [ngrokUrl, router]);

  if (!ngrokUrl) return null;

  return (
    <>
      <header className="app-header">
        <h1>🎧 VirtualDJ Remote</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ConnectionStatus />
          <button
            className="btn btn-secondary"
            onClick={() => {
              localStorage.removeItem("vdj_connection");
              window.location.href = "/setup";
            }}
            style={{ fontSize: "0.8125rem" }}
          >
            ⚙ Configuración
          </button>
        </div>
      </header>

      <main className="container">
        <div className="dashboard-grid">
          {/* Columna izquierda — Buscador */}
          <div>
            <div className="card" style={{ overflow: "hidden" }}>
              <SearchBar />
            </div>

            {/* Resultados */}
            {searchResults.length > 0 && (
              <div style={{ marginTop: "0.75rem" }}>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.5rem",
                    paddingLeft: "0.25rem",
                  }}
                >
                  {searchResults.length} resultado
                  {searchResults.length !== 1 ? "s" : ""}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
                >
                  {searchResults.map((track, i) => (
                    <TrackCard key={track.id} track={track} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Estado vacío del buscador */}
            {searchResults.length === 0 && (
              <div className="empty-state" style={{ marginTop: "2rem" }}>
                <div className="empty-state-icon">🔍</div>
                <p>Busca canciones en Deezer o en tu biblioteca de VDJ</p>
              </div>
            )}
          </div>

          {/* Columna derecha — Cola Automix */}
          <div>
            <AutomixQueue />
          </div>
        </div>
      </main>
    </>
  );
}
