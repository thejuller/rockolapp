"use client";

import { useAppStore } from "@/lib/store";
import { SearchBar } from "@/components/SearchBar";
import { TrackCard } from "@/components/TrackCard";
import { AutomixQueue } from "@/components/AutomixQueue";
import { Music, Radio } from "lucide-react";

export default function DashboardPage() {
  const { searchResults, isSearching } = useAppStore();

  return (
    <div className="bg-primary min-h-screen">
      <main className="container main-layout" style={{ paddingTop: '1.5rem' }}>
        <div className="dashboard-grid">
          {/* Columna Izquierda: Búsqueda y Resultados */}
          <div className="animate-in">
            <div className="card">
              <div 
                style={{ 
                  padding: '1.5rem 1.25rem 0.5rem', 
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '0.5rem'
                }}
              >
                <h2 className="font-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  TÚ CONTROLAS LA <span className="text-accent">ROKOLA</span>
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Busca artistas o canciones para añadir a la cola de reproducción en vivo.
                </p>
              </div>
              
              <SearchBar />
            </div>

            {/* Resultados de Búsqueda */}
            {searchResults.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 className="section-title">
                  <Music size={16} className="text-accent" />
                  Resultados
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  {searchResults.map((track, i) => (
                    <TrackCard key={track.id} track={track} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchResults.length === 0 && !isSearching && (
              <div 
                className="card" 
                style={{ 
                  marginTop: '2rem', 
                  padding: '3rem 1.5rem', 
                  textAlign: 'center',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)'
                }}
              >
                <Radio size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ color: 'var(--text-secondary)' }}>
                  Ingresa el nombre de una canción para comenzar.
                </p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Cola Automix */}
          <div className="animate-in" style={{ animationDelay: '100ms' }}>
            <AutomixQueue />
          </div>
        </div>
      </main>
    </div>
  );
}
