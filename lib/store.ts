"use client";

import { create } from "zustand";
import type { Track, DeezerTrack } from "./types";
import { vdjPing, vdjQuery, vdjExecute } from "./vdj-client";

/* ───── Helpers ───── */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function sanitizeSearch(text: string): string {
  return text
    .replace(/['"]/g, " ")
    .replace(/[&|;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dbg(label: string, data?: unknown) {
  console.log(`[VDJ] ${label}`, data ?? "");
}

async function readBrowsedSong(
  url: string,
  token: string
): Promise<{ title: string; artist: string; filepath: string } | null> {
  const titleRes = await vdjQuery(url, token, 'get_browsed_song "title"');
  const title = titleRes.data?.trim() ?? "";
  if (!titleRes.ok || !title || title.startsWith("error:")) return null;

  const artistRes = await vdjQuery(url, token, 'get_browsed_song "artist"');
  const fpRes = await vdjQuery(url, token, 'get_browsed_song "filepath"');

  return {
    title,
    artist: artistRes.data?.trim() || "Desconocido",
    filepath: fpRes.data?.trim() || "",
  };
}

/**
 * Busca y agrega UNA canción al automix de forma nativa.
 * Para Deezer: navega a la carpeta Deezer y busca por título.
 * Para locales: busca en la biblioteca por título.
 */
async function searchAndAddNative(
  ngrokUrl: string,
  bearerToken: string,
  track: Track
): Promise<void> {
  if (track.source === "deezer") {
    await vdjExecute(ngrokUrl, bearerToken, 'browser_gotofolder "Deezer"');
    await wait(800);
    await vdjExecute(ngrokUrl, bearerToken, 'browser_window "songs"');
    await wait(200);
    // Búsqueda específica: Artista + Título para evitar colisiones comunes (ej: "Maria")
    const term = sanitizeSearch(`${track.artist} ${track.title}`);
    await vdjExecute(ngrokUrl, bearerToken, `search '${term}'`);
    
    // Esperar más tiempo para que Deezer complete la búsqueda de red
    await wait(4500); 
    
    // Hack de Focus: Mueve el foco fuera de la caja de búsqueda hacia la lista de resultados
    await vdjExecute(ngrokUrl, bearerToken, "action_macro 'tab'");
    await wait(300);
    await vdjExecute(ngrokUrl, bearerToken, "browser_scroll 'top'");
    await wait(300);

    // Búsqueda de coincidencia exacta entre los primeros 5 resultados
    for (let i = 0; i < 5; i++) {
      const songInfo = await readBrowsedSong(ngrokUrl, bearerToken);
      if (songInfo) {
        const normalize = (s: string) => sanitizeSearch(s).toLowerCase();
        const vdjTitle = normalize(songInfo.title);
        const vdjArtist = normalize(songInfo.artist);
        const webTitle = normalize(track.title);
        const webArtist = normalize(track.artist);
        
        // Verificamos si encontramos lo que buscamos
        if ((vdjTitle.includes(webTitle) || webTitle.includes(vdjTitle)) &&
            (vdjArtist.includes(webArtist) || webArtist.includes(vdjArtist))) {
          dbg("Match perfecto encontrado en VDJ Deezer:", songInfo);
          break; // Pista seleccionada correctamente
        }
      }
      // Bajar a la siguiente pista
      await vdjExecute(ngrokUrl, bearerToken, "browser_scroll +1");
      await wait(300);
    }
    
  } else {
    await vdjExecute(ngrokUrl, bearerToken, 'browser_window "songs"');
    await wait(200);
    const term = sanitizeSearch(`${track.artist} ${track.title}`);
    await vdjExecute(ngrokUrl, bearerToken, `search '${term}'`);
    await wait(1200);
    await vdjExecute(ngrokUrl, bearerToken, "browser_scroll 'top'");
    await wait(200);
    
    // Búsqueda de coincidencia exacta local
    for (let i = 0; i < 5; i++) {
      const songInfo = await readBrowsedSong(ngrokUrl, bearerToken);
      if (songInfo) {
        if (songInfo.filepath === track.loadPath) {
          dbg("Match perfecto por FilePath en VDJ Local");
          break;
        }
      }
      await vdjExecute(ngrokUrl, bearerToken, "browser_scroll +1");
      await wait(300);
    }
  }

  // Verificar si el automix está vacío
  const checkQueue = await vdjQuery(ngrokUrl, bearerToken, 'get_automix_song "title" 1');
  const automixTitle1 = checkQueue.data?.trim() ?? "";
  
  // Si el automix está vacío, playlist_add falla silenciosamente. Debemos usar automix_add_next
  if (!checkQueue.ok || !automixTitle1 || automixTitle1.startsWith("error:")) {
    dbg("Automix vacío, usando automix_add_next (primer track)");
    await vdjExecute(ngrokUrl, bearerToken, "automix_add_next");
  } else {
    // Si ya hay canciones, playlist_add las envía AL FINAL de la cola (requerimiento del usuario)
    dbg("Automix activo, usando playlist_add (al final de la cola)");
    await vdjExecute(ngrokUrl, bearerToken, "playlist_add");
  }
}

/* ───── Store ────── */

interface AppState {
  ngrokUrl: string;
  bearerToken: string;
  isConnected: boolean;
  isCheckingConnection: boolean;
  searchQuery: string;
  searchResults: Track[];
  isSearching: boolean;
  automixQueue: Track[];
  isLoadingQueue: boolean;

  setConnection: (ngrokUrl: string, bearerToken: string) => void;
  loadConnectionFromStorage: () => void;
  checkConnection: () => Promise<boolean>;
  setSearchQuery: (q: string) => void;
  search: () => Promise<void>;
  addToQueue: (track: Track) => Promise<void>;
  refreshQueue: () => Promise<void>;
  loadTrackToDeck: (track: Track, deck?: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  ngrokUrl: "",
  bearerToken: "",
  isConnected: false,
  isCheckingConnection: false,
  searchQuery: "",
  searchResults: [],
  isSearching: false,
  automixQueue: [],
  isLoadingQueue: false,

  /* ─────── Conexión ─────── */

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
    try {
      const ok = await vdjPing(ngrokUrl, bearerToken);
      set({ isConnected: ok, isCheckingConnection: false });
      return ok;
    } catch (error) {
      console.error("Error verificando conexión:", error);
      set({ isConnected: false, isCheckingConnection: false });
      return false;
    }
  },

  /* ─────── Búsqueda ─────── */
  setSearchQuery: (q) => set({ searchQuery: q }),

  search: async () => {
    const { searchQuery } = get();
    if (!searchQuery.trim()) return;
    set({ isSearching: true, searchResults: [] });

    try {
      const res = await fetch(
        `/api/deezer?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      const tracks: Track[] = (data.results || []).map((t: DeezerTrack) => ({
        id: `dz-${t.id}`,
        title: t.title,
        artist: t.artist.name,
        album: t.album.title,
        duration: t.duration,
        coverUrl: t.album.cover_medium,
        source: "deezer" as const,
        deezerLink: t.link,
        loadPath: "",
      }));
      set({ searchResults: tracks });
    } catch (err) {
      console.error("Error en búsqueda:", err);
    } finally {
      set({ isSearching: false });
    }
  },

  /* ─────── Automix Queue ─────── */

  addToQueue: async (track) => {
    const { ngrokUrl, bearerToken } = get();

    try {
      dbg("addToQueue:", `${track.artist} - ${track.title}`);
      set({ isLoadingQueue: true });

      // Añadir la canción nativamente en VDJ
      await searchAndAddNative(ngrokUrl, bearerToken, track);

      // Refrescar cola para mantener sincronización web/VDJ
      await wait(1500);
      get().refreshQueue();

    } catch (error) {
      console.error("Error adding to queue:", error);
      set({ isLoadingQueue: false });
    }
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
          `get_automix_song "title" ${i}`
        );
        const title = res.data?.trim() ?? "";
        if (!res.ok || !title || title.startsWith("error:")) break;

        const artistRes = await vdjQuery(
          ngrokUrl,
          bearerToken,
          `get_automix_song "artist" ${i}`
        );
        tracks.push({
          id: `queue-${i}`,
          title,
          artist: artistRes.data?.trim() || "",
          source: "vdj",
          loadPath: "",
        });
      }
    } catch (err) {
      console.error("Error refrescando cola:", err);
    }

    dbg(`refreshQueue: ${tracks.length} canciones`);
    set({ automixQueue: tracks, isLoadingQueue: false });
  },

  /* ─────── Deck ─────── */

  loadTrackToDeck: async (track, deck = 1) => {
    const { ngrokUrl, bearerToken } = get();

    try {
      if (track.source === "deezer") {
        dbg(`loadToDeck Deezer: ${track.title} → deck ${deck}`);
        await vdjExecute(
          ngrokUrl,
          bearerToken,
          'browser_gotofolder "Deezer"'
        );
        await wait(1000);
        await vdjExecute(ngrokUrl, bearerToken, 'browser_window "songs"');
        // Búsqueda específica: Artista + Título
        const terms = sanitizeSearch(`${track.artist} ${track.title}`);
        await vdjExecute(ngrokUrl, bearerToken, `search '${terms}'`);
        
        // Esperar más tiempo para red Deezer
        await wait(4500);
        
        // Hack de Focus: mover el foco del buscador a los resultados
        await vdjExecute(ngrokUrl, bearerToken, "action_macro 'tab'");
        await wait(300);
        await vdjExecute(ngrokUrl, bearerToken, "browser_scroll 'top'");
        await wait(300);
        
        // Búsqueda de coincidencia exacta entre los primeros 5 resultados
        for (let i = 0; i < 5; i++) {
          const songInfo = await readBrowsedSong(ngrokUrl, bearerToken);
          if (songInfo) {
            const normalize = (s: string) => sanitizeSearch(s).toLowerCase();
            const vdjTitle = normalize(songInfo.title);
            const vdjArtist = normalize(songInfo.artist);
            const webTitle = normalize(track.title);
            const webArtist = normalize(track.artist);
            
            if ((vdjTitle.includes(webTitle) || webTitle.includes(vdjTitle)) &&
                (vdjArtist.includes(webArtist) || webArtist.includes(vdjArtist))) {
              dbg("Match perfecto encontrado para cargar deck en VDJ Deezer:", songInfo);
              break;
            }
          }
          await vdjExecute(ngrokUrl, bearerToken, "browser_scroll +1");
          await wait(300);
        }
        
        await vdjExecute(ngrokUrl, bearerToken, `deck ${deck} load`);
      } else {
        await vdjExecute(
          ngrokUrl,
          bearerToken,
          `deck ${deck} load "${track.loadPath}"`
        );
      }
    } catch (error) {
      console.error(`Error loading to deck ${deck}:`, error);
    }
  },
}));
