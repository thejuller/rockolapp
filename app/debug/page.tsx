"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { vdjQuery, vdjExecute } from "@/lib/vdj-client";

interface LogEntry {
  id: number;
  time: string;
  type: "query" | "execute";
  script: string;
  response: string;
  ok: boolean;
}

export default function DebugPage() {
  const { ngrokUrl, bearerToken, loadConnectionFromStorage } = useAppStore();
  const [script, setScript] = useState("");
  const [action, setAction] = useState<"query" | "execute">("query");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadConnectionFromStorage();
  }, [loadConnectionFromStorage]);

  const runCommand = async (overrideAction?: "query" | "execute", overrideScript?: string) => {
    const act = overrideAction || action;
    const scr = overrideScript || script;
    if (!scr.trim() || !ngrokUrl) return;

    setRunning(true);
    try {
      const fn = act === "query" ? vdjQuery : vdjExecute;
      const res = await fn(ngrokUrl, bearerToken, scr);
      const entry: LogEntry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: act,
        script: scr,
        response: JSON.stringify(res, null, 2),
        ok: res.ok,
      };
      setLogs((prev) => [entry, ...prev]);
    } catch (err) {
      const entry: LogEntry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: act,
        script: scr,
        response: `ERROR: ${err}`,
        ok: false,
      };
      setLogs((prev) => [entry, ...prev]);
    }
    setRunning(false);
  };

  // Diagnóstico automático completo
  const runDiagnostics = async () => {
    setRunning(true);
    const tests = [
      { act: "query" as const, cmd: "get_clock", desc: "Conexión básica" },
      { act: "execute" as const, cmd: "browser_window 'songs'", desc: "Cambiar a vista canciones" },
      { act: "query" as const, cmd: "get_browsed_song 'title'", desc: "Título canción seleccionada" },
      { act: "query" as const, cmd: "get_browsed_song 'artist'", desc: "Artista canción seleccionada" },
      { act: "query" as const, cmd: "get_browsed_song 'filepath'", desc: "Filepath canción seleccionada" },
      { act: "execute" as const, cmd: "browser_scroll 'top'", desc: "Scroll al inicio" },
      { act: "query" as const, cmd: "get_browsed_song 'title'", desc: "Título tras scroll top" },
      { act: "execute" as const, cmd: "browser_scroll +1", desc: "Scroll siguiente" },
      { act: "query" as const, cmd: "get_browsed_song 'title'", desc: "Título tras scroll +1" },
      { act: "execute" as const, cmd: "browser_search \"test\"", desc: "Buscar 'test'" },
      { act: "query" as const, cmd: "get_browsed_song 'title'", desc: "Título tras búsqueda" },
      { act: "query" as const, cmd: "get_automix_song 'title' 1", desc: "Automix canción #1" },
      { act: "query" as const, cmd: "get_automix_song 'title' 2", desc: "Automix canción #2" },
    ];

    for (const test of tests) {
      try {
        const fn = test.act === "query" ? vdjQuery : vdjExecute;
        const res = await fn(ngrokUrl, bearerToken, test.cmd);
        const entry: LogEntry = {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString(),
          type: test.act,
          script: `[${test.desc}] ${test.cmd}`,
          response: JSON.stringify(res, null, 2),
          ok: res.ok,
        };
        setLogs((prev) => [entry, ...prev]);
      } catch (err) {
        const entry: LogEntry = {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString(),
          type: test.act,
          script: `[${test.desc}] ${test.cmd}`,
          response: `ERROR: ${err}`,
          ok: false,
        };
        setLogs((prev) => [entry, ...prev]);
      }
      // Pausa entre comandos
      await new Promise((r) => setTimeout(r, 800));
    }
    setRunning(false);
  };

  if (!ngrokUrl) {
    return (
      <div style={{ padding: "2rem", color: "#fff", background: "#111", minHeight: "100vh" }}>
        <h1>⚠️ Sin conexión</h1>
        <p>Primero configura la conexión en <a href="/setup" style={{ color: "#6cf" }}>/setup</a></p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", color: "#e0e0e0", background: "#0d0d0d", minHeight: "100vh", fontFamily: "monospace" }}>
      <h1 style={{ color: "#fff", marginBottom: "0.5rem" }}>🔧 VDJ Debug Console</h1>
      <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "1rem" }}>
        URL: {ngrokUrl} | Token: {bearerToken ? "***" : "(ninguno)"}
      </p>

      {/* Diagnóstico rápido */}
      <button
        onClick={runDiagnostics}
        disabled={running}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          padding: "0.6rem 1.2rem",
          borderRadius: "6px",
          cursor: running ? "wait" : "pointer",
          fontWeight: 600,
          marginBottom: "1rem",
          opacity: running ? 0.6 : 1,
        }}
      >
        {running ? "⏳ Ejecutando..." : "🚀 Ejecutar Diagnóstico Completo"}
      </button>

      {/* Comando manual */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as "query" | "execute")}
          style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #333", padding: "0.5rem", borderRadius: "4px" }}
        >
          <option value="query">query</option>
          <option value="execute">execute</option>
        </select>
        <input
          type="text"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="VDJScript command..."
          onKeyDown={(e) => e.key === "Enter" && runCommand()}
          style={{
            flex: 1,
            minWidth: "250px",
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #333",
            padding: "0.5rem 0.75rem",
            borderRadius: "4px",
            fontSize: "0.9rem",
          }}
        />
        <button
          onClick={() => runCommand()}
          disabled={running}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Enviar
        </button>
      </div>

      {/* Botones rápidos */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "🕐 get_clock", act: "query" as const, cmd: "get_clock" },
          { label: "📁 browser_window songs", act: "execute" as const, cmd: "browser_window 'songs'" },
          { label: "⬆️ scroll top", act: "execute" as const, cmd: "browser_scroll 'top'" },
          { label: "⬇️ scroll +1", act: "execute" as const, cmd: "browser_scroll +1" },
          { label: "🎵 get title", act: "query" as const, cmd: "get_browsed_song 'title'" },
          { label: "👤 get artist", act: "query" as const, cmd: "get_browsed_song 'artist'" },
          { label: "📂 get filepath", act: "query" as const, cmd: "get_browsed_song 'filepath'" },
          { label: "🔍 search test", act: "execute" as const, cmd: 'browser_search "test"' },
          { label: "➕ automix_add_next", act: "execute" as const, cmd: "automix_add_next" },
          { label: "📋 automix #1", act: "query" as const, cmd: "get_automix_song 'title' 1" },
          { label: "📑 playlist_add", act: "execute" as const, cmd: "playlist_add" },
          { label: "🎧 deck 1 load", act: "execute" as const, cmd: "deck 1 load" },
        ].map((btn) => (
          <button
            key={btn.cmd + btn.act}
            onClick={() => runCommand(btn.act, btn.cmd)}
            disabled={running}
            style={{
              background: "#222",
              color: "#ccc",
              border: "1px solid #444",
              padding: "0.35rem 0.7rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.75rem",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>📝 Log ({logs.length})</h2>
          <button
            onClick={() => setLogs([])}
            style={{ background: "transparent", color: "#888", border: "1px solid #333", padding: "0.25rem 0.5rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}
          >
            Limpiar
          </button>
        </div>
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {logs.map((entry) => (
            <div
              key={entry.id}
              style={{
                background: entry.ok ? "#0a1a0a" : "#1a0a0a",
                border: `1px solid ${entry.ok ? "#1a3a1a" : "#3a1a1a"}`,
                borderRadius: "6px",
                padding: "0.6rem 0.8rem",
                marginBottom: "0.4rem",
                fontSize: "0.8rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "#888" }}>{entry.time}</span>
                <span style={{ color: entry.type === "query" ? "#6cf" : "#fc6", fontWeight: 600 }}>
                  {entry.type.toUpperCase()}
                </span>
                <span style={{ color: entry.ok ? "#4f4" : "#f44" }}>
                  {entry.ok ? "✅ OK" : "❌ FAIL"}
                </span>
              </div>
              <div style={{ color: "#fff", marginBottom: "0.25rem" }}>
                <code>{entry.script}</code>
              </div>
              <pre style={{ color: "#aaa", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {entry.response}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
