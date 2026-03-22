// === Tipos para Virtual DJ Remote Control ===

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  coverUrl?: string;
  source: "vdj" | "deezer";
  /** Ruta local (VDJ) o ID Deezer con prefijo dz */
  loadPath: string;
}

export interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  artist: { name: string };
  album: { title: string; cover_small: string; cover_medium: string };
  link: string;
}

export interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
}

export interface VdjProxyRequest {
  action: "query" | "execute";
  script: string;
  ngrokUrl: string;
  bearerToken: string;
}

export interface VdjProxyResponse {
  ok: boolean;
  data?: string;
  error?: string;
}

export interface ConnectionConfig {
  ngrokUrl: string;
  bearerToken: string;
}
