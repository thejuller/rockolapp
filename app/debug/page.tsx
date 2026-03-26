"use client";

import { useState } from "react";
import { vdjQuery, vdjExecute } from "@/lib/vdj-client";
import { 
  Settings, 
  Play, 
  Search, 
  Terminal, 
  RefreshCw, 
  Clock, 
  Folder, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  List, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

interface LogEntry {
  id: number;
  time: string;
  type: "query" | "execute";
  script: string;
  response: string;
  ok: boolean;
}

export default function DebugPage() {
  const [script, setScript] = useState("");
  const [action, setAction] = useState<"query" | "execute">("query");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  const runCommand = async (overrideAction?: "query" | "execute", overrideScript?: string) => {
    const act = overrideAction || action;
    const scr = overrideScript || script;
    if (!scr.trim()) return;

    setRunning(true);
    try {
      const fn = act === "query" ? vdjQuery : vdjExecute;
      const res = await fn(scr);
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

  const runDiagnostics = async () => {
    setRunning(true);
    const tests = [
      { act: "query" as const, cmd: "get_clock", desc: "Conexión básica" },
      { act: "execute" as const, cmd: "browser_window 'songs'", desc: "Cambiar a vista canciones" },
      { act: "query" as const, cmd: "get_browsed_song 'title'", desc: "Título canción seleccionada" },
      { act: "query" as const, cmd: "get_browsed_song 'artist'", desc: "Artista canción seleccionada" },
      { act: "execute" as const, cmd: "browser_scroll 'top'", desc: "Scroll al inicio" },
      { act: "execute" as const, cmd: "browser_scroll +1", desc: "Scroll siguiente" },
      { act: "query" as const, cmd: "get_automix_song 'title' 1", desc: "Automix canción #1" },
    ];

    for (const test of tests) {
      await runCommand(test.act, test.cmd);
      await new Promise((r) => setTimeout(r, 800));
    }
    setRunning(false);
  };

  return (
    <div style={{ padding: "1.5rem", color: "var(--text-primary)", background: "var(--bg-primary)", minHeight: "100vh", fontFamily: "var(--font-inter)" }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="font-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
          <Settings size={24} className="text-accent" />
          VDJ Debug Console
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Herramientas de diagnóstico para comandos VDJScript
        </p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={runDiagnostics}
          disabled={running}
          className="btn btn-primary"
          style={{ padding: '0.6rem 1.25rem' }}
        >
          {running ? <Loader2 size={18} className="animate-spin" /> : <Terminal size={18} />}
          Ejecutar Diagnóstico
        </button>
        
        <button
          onClick={() => setLogs([])}
          className="btn btn-secondary"
        >
          <Trash2 size={16} />
          Limpiar Log
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as "query" | "execute")}
            className="input"
            style={{ width: 'auto', background: 'rgba(255,255,255,0.05)' }}
          >
            <option value="query">QUERY</option>
            <option value="execute">EXECUTE</option>
          </select>
          <input
            type="text"
            className="input"
            style={{ flex: 1 }}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Escribe un comando VDJScript..."
            onKeyDown={(e) => e.key === "Enter" && runCommand()}
          />
          <button
            onClick={() => runCommand()}
            disabled={running}
            className="btn btn-primary"
          >
            <Play size={16} fill="currentColor" />
            Enviar
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          {[
            { label: "Clock", act: "query" as const, cmd: "get_clock", icon: <Clock size={14} /> },
            { label: "Songs", act: "execute" as const, cmd: "browser_window 'songs'", icon: <Folder size={14} /> },
            { label: "Scroll Top", act: "execute" as const, cmd: "browser_scroll 'top'", icon: <ChevronUp size={14} /> },
            { label: "Scroll +1", act: "execute" as const, cmd: "browser_scroll +1", icon: <ChevronDown size={14} /> },
            { label: "Get Title", act: "query" as const, cmd: "get_browsed_song 'title'", icon: <Search size={14} /> },
            { label: "Add Next", act: "execute" as const, cmd: "automix_add_next", icon: <Plus size={14} /> },
            { label: "Queue #1", act: "query" as const, cmd: "get_automix_song 'title' 1", icon: <List size={14} /> },
          ].map((btn) => (
            <button
              key={btn.cmd + btn.act}
              onClick={() => runCommand(btn.act, btn.cmd)}
              disabled={running}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in">
        <h2 className="font-title" style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={18} />
          Registro de Actividad ({logs.length})
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {logs.map((entry) => (
            <div
              key={entry.id}
              className="card"
              style={{
                padding: "1rem",
                borderLeft: `4px solid ${entry.ok ? 'var(--success)' : 'var(--danger)'}`,
                background: entry.ok ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
              }}
            >
              <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "0.5rem" }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: "var(--text-muted)", fontSize: '0.75rem' }}>{entry.time}</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: entry.type === 'query' ? '#60a5fa' : '#fbbf24',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {entry.type.toUpperCase()}
                  </span>
                </div>
                {entry.ok ? (
                  <CheckCircle2 size={16} className="text-success" />
                ) : (
                  <AlertCircle size={16} className="text-danger" />
                )}
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <code style={{ color: "var(--text-primary)", fontWeight: 600 }}>{entry.script}</code>
              </div>
              <pre style={{ 
                color: "var(--text-secondary)", 
                margin: 0, 
                fontSize: '0.8rem',
                background: 'rgba(0,0,0,0.3)',
                padding: '0.75rem',
                borderRadius: '4px',
                overflowX: 'auto'
              }}>
                {entry.response}
              </pre>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.3 }}>
              <Terminal size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No hay actividad registrada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
