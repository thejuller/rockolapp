"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ListMusic, RefreshCw, Music } from "lucide-react";

export function AutomixQueue() {
  const { automixQueue, refreshQueue, isLoadingQueue } = useAppStore();

  useEffect(() => {
    refreshQueue();
    // Refresco automático cada 30 segundos
    const interval = setInterval(refreshQueue, 30000);
    return () => clearInterval(interval);
  }, [refreshQueue]);

  return (
    <div className="card queue-container animate-in" style={{ animationDelay: '200ms' }}>
      <div className="queue-header">
        <h3 className="section-title" style={{ margin: 0 }}>
          <ListMusic size={18} className="text-accent" />
          Próximas en la Rokola
        </h3>
        
        <button
          className="btn-ghost btn-icon"
          onClick={refreshQueue}
          disabled={isLoadingQueue}
          title="Refrescar Cola"
          aria-label="Refrescar cola de reproducción"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px',
            padding: '0.5rem'
          }}
        >
          <RefreshCw size={16} className={isLoadingQueue ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="queue-list">
        {automixQueue.length > 0 ? (
          automixQueue.map((track, i) => (
            <div key={track.id} className="queue-item">
              <span className="queue-index">{i + 1}</span>
              <div className="track-meta">
                <span className="track-title" style={{ fontSize: '0.875rem' }}>{track.title}</span>
                <span className="track-artist" style={{ fontSize: '0.75rem' }}>{track.artist}</span>
              </div>
              <Music size={14} className="text-muted" />
            </div>
          ))
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
            <p style={{ fontSize: '0.875rem' }}>La cola está vacía.</p>
            <p style={{ fontSize: '0.75rem' }}>¡Pide una canción!</p>
          </div>
        )}
      </div>

      {isLoadingQueue && automixQueue.length === 0 && (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      )}
    </div>
  );
}
