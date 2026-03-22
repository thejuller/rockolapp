"use client";

import { motion } from "framer-motion";
import type { Track } from "@/lib/types";
import { useAppStore } from "@/lib/store";

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TrackCardProps {
  track: Track;
  index: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { addToQueue, loadTrackToDeck } = useAppStore();

  return (
    <motion.div
      className="track-card card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          className="track-cover"
          loading="lazy"
        />
      ) : (
        <div className="track-cover-placeholder">♪</div>
      )}

      <div className="track-info">
        <div className="track-title" title={track.title}>
          {track.title}
        </div>
        <div className="track-artist" title={track.artist}>
          {track.artist}
          {track.album && ` · ${track.album}`}
        </div>
        {track.duration !== undefined && track.duration > 0 && (
          <span className="track-duration">
            {formatDuration(track.duration)}
          </span>
        )}
      </div>

      <div className="track-actions">
        <button
          className="btn btn-icon"
          title="Cargar en Deck 1"
          onClick={() => loadTrackToDeck(track, 1)}
        >
          ▶
        </button>
        <button
          className="btn btn-icon"
          title="Añadir a la cola Automix"
          onClick={() => addToQueue(track)}
        >
          ＋
        </button>
      </div>
    </motion.div>
  );
}
