"use client";

import { create } from "zustand";
import type { Track, DeezerTrack } from "./types";
import { vdjPing, vdjQuery, vdjExecute } from "./vdj-client";

interface AppState {
  // === Conexión ===
  ngrokUrl: string;
  bearerToken: string;
  isConnected: boolean;
  isCheckingConnection: boolean;

  // === Búsqueda ===
  searchQuery: string;
  searchSource: "vdj" | "deezer";
  searchResults: Track[];
  isSearching: boolean;

  // === Automix Queue ===
  automixQueue: Track[];
  isLoadingQueue: boolean;

  // === Acciones de conexión ===
  setConnection: (ngrokUrl: string, bearerToken: string) => void;
  loadConnectionFromStorage: () => void;
  checkConnection: () => Promise<boolean>;

  // === Acciones de búsqueda ===
  setSearchQuery: (q: string) => void;
  setSearchSource: (source: "vdj" | "deezer") => void;
  search: () => Promise<void>;

  // === Acciones de automix ===
  addToQueue: (track: Track) => Promise<void>;
  refreshQueue: () => Promise<void>;
  loadTrackToDeck: (track: Track, deck?: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Estado inicial
  ngrokUrl: "",
  bearerToken: "",
  isConnected: false,
  isCheckingConnection: false,
  searchQuery: "",
  searchSource: "deezer",
  searchResults: [],
  isSearching: false,
  automixQueue: [],
  isLoadingQueue: false,

  setConnection: (ngrokUrl, bearerToken) => {
    set({ ngrokUrl, bearerToken });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "vdj_connection",
        JSON.stringify({ ngrokUrl, bearerToken })
      );
    }
  },

  loadConnectionFromStorage: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("vdj_connection");
    if (stored) {
      try {
        const { ngrokUrl, bearerToken } = JSON.parse(stored);
        set({ ngrokUrl, bearerToken });
      } catch {
        /* ignore */
      }
    }
  },

  checkConnection: async () => {
    const { ngrokUrl, bearerToken } = get();
    if (!ngrokUrl) return false;
    set({ isCheckingConnection: true });
    const ok = await vdjPing(ngrokUrl, bearerToken);
    set({ isConnected: ok, isCheckingConnection: false });
    return ok;
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchSource: (source) => set({ searchSource: source, searchResults: [] }),

  search: async () => {
    const { searchQuery, searchSource, ngrokUrl, bearerToken } = get();
    if (!searchQuery.trim()) return;
    set({ isSearching: true, searchResults: [] });

    try {
      if (searchSource === "deezer") {
        const res = await fetch(
          `/api/deezer?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        const tracks: Track[] = (data.results || []).map(
          (t: DeezerTrack) => ({
            id: `dz-${t.id}`,
            title: t.title,
            artist: t.artist.name,
            album: t.album.title,
            duration: t.duration,
            coverUrl: t.album.cover_medium,
            source: "deezer" as const,
            loadPath: `deezer:${t.id}`,
          })
        );
        set({ searchResults: tracks });
      } else {
        // Búsqueda VDJ: browser_search → leer resultados
        await vdjExecute(
          ngrokUrl,
          bearerToken,
          `browser_search "${searchQuery}"`
        );
        // Esperar un poco para que VDJ procese
        await new Promise((r) => setTimeout(r, 300));
        await vdjExecute(
          ngrokUrl,
          bearerToken,
          "browser_window 'songs' & browser_scroll top"
        );
        await new Promise((r) => setTimeout(r, 200));

        const tracks: Track[] = [];
        for (let i = 1; i <= 20; i++) {
          const titleRes = await vdjQuery(
            ngrokUrl,
            bearerToken,
            `get_browsed_song 'title' ${i}`
          );
          // Si el query falla o VDJ devuelve un error genérico (vía Network Control)
          if (!titleRes.ok || !titleRes.data?.trim() || titleRes.data.toLowerCase().startsWith("error:")) break;

          const artistRes = await vdjQuery(
            ngrokUrl,
            bearerToken,
            `get_browsed_song 'artist' ${i}`
          );
          const pathRes = await vdjQuery(
            ngrokUrl,
            bearerToken,
            `get_browsed_song 'filepath' ${i}`
          );

          tracks.push({
            id: `vdj-${i}`,
            title: titleRes.data.trim(),
            artist: artistRes.data?.trim() || "Desconocido",
            source: "vdj",
            loadPath: pathRes.data?.trim() || "",
          });
        }
        set({ searchResults: tracks });
      }
    } catch (err) {
      console.error("Error en búsqueda:", err);
    } finally {
      set({ isSearching: false });
    }
  },

  addToQueue: async (track) => {
    const { ngrokUrl, bearerToken } = get();
    const cmd = `automix_add_next "${track.loadPath}"`;
    await vdjExecute(ngrokUrl, bearerToken, cmd);
    // Refrescar la cola después de añadir
    setTimeout(() => get().refreshQueue(), 500);
  },

  refreshQueue: async () => {
    const { ngrokUrl, bearerToken } = get();
    if (!ngrokUrl) return;
    set({ isLoadingQueue: true });

    const tracks: Track[] = [];
    try {
      for (let i = 1; i <= 50; i++) {
        const res = await vdjQuery(
          ngrokUrl,
          bearerToken,
          `get_automix_song 'title' ${i}`
        );
        // Si no hay datos o VDJ devuelve un error genérico, asumimos fin de cola
        if (!res.ok || !res.data?.trim() || res.data.toLowerCase().startsWith("error:")) break;

        const artistRes = await vdjQuery(
          ngrokUrl,
          bearerToken,
          `get_automix_song 'artist' ${i}`
        );

        tracks.push({
          id: `queue-${i}`,
          title: res.data.trim(),
          artist: artistRes.data?.trim() || "",
          source: "vdj",
          loadPath: "",
        });
      }
    } catch (err) {
      console.error("Error refrescando cola:", err);
    }

    set({ automixQueue: tracks, isLoadingQueue: false });
  },

  loadTrackToDeck: async (track, deck = 1) => {
    const { ngrokUrl, bearerToken } = get();
    const cmd = `deck ${deck} load "${track.loadPath}"`;
    await vdjExecute(ngrokUrl, bearerToken, cmd);
  },
}));
