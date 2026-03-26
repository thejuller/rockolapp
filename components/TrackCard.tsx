"use client";

import { useAppStore } from "@/lib/store";
import type { Track } from "@/lib/types";
import { Plus, Music } from "lucide-react";
import Image from "next/image";

interface TrackCardProps {
  track: Track;
  index: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { addToQueue, isLoadingQueue } = useAppStore();

  const handleAddToQueue = async () => {
    await addToQueue(track);
  };

  return (
    <div className="track-card animate-in" style={{ animationDelay: `${index * 50}ms` }}>
      {track.coverUrl ? (
        <div className="track-img" style={{ position: 'relative', overflow: 'hidden' }}>
          <Image 
            src={track.coverUrl} 
            alt={track.title} 
            fill 
            sizes="56px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="track-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Music size={24} />
        </div>
      )}

      <div className="track-meta">
        <span className="track-title">{track.title}</span>
        <span className="track-artist">{track.artist}</span>
      </div>

      <div className="track-actions" style={{ flexShrink: 0 }}>
        <button
          className="btn btn-primary"
          onClick={handleAddToQueue}
          disabled={isLoadingQueue}
          title="Añadir a la Cola"
          aria-label={`Pedir ${track.title}`}
          style={{ 
            padding: '0.625rem 1rem', 
            fontSize: '0.8125rem', 
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
          }}
        >
          <Plus size={16} />
          <span style={{ fontWeight: 700 }}>PEDIR</span>
        </button>
      </div>
    </div>
  );
}
