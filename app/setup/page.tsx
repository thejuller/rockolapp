"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function SetupPage() {
  const router = useRouter();
  const {
    ngrokUrl,
    bearerToken,
    setConnection,
    checkConnection,
    isCheckingConnection,
    isConnected,
    loadConnectionFromStorage,
  } = useAppStore();

  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [tested, setTested] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    loadConnectionFromStorage();
  }, [loadConnectionFromStorage]);

  useEffect(() => {
    if (ngrokUrl) setUrl(ngrokUrl);
    if (bearerToken) setToken(bearerToken);
  }, [ngrokUrl, bearerToken]);

  const handleTest = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setConnection(url.trim(), token.trim());
    setTested(false);
    setTestResult(null);

    // Esperar a que el store se actualice
    await new Promise((r) => setTimeout(r, 50));

    const ok = await checkConnection();
    setTested(true);
    setTestResult(ok);
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="setup-page">
      <div className="card setup-card">
        <h1>🎧 VirtualDJ Remote</h1>
        <p className="subtitle">
          Conecta con tu instancia de Virtual DJ a través de ngrok.
        </p>

        <form onSubmit={handleTest}>
          <div className="form-group">
            <label htmlFor="ngrok-url" className="form-label">
              URL del Túnel (ngrok)
            </label>
            <input
              id="ngrok-url"
              type="url"
              className="input"
              placeholder="https://abc123.ngrok-free.app"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTested(false);
              }}
              required
            />
            <p className="form-hint">
              Ejecuta <code className="mono">ngrok http 8080</code> en tu PC
              local.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="bearer-token" className="form-label">
              Bearer Token (opcional)
            </label>
            <input
              id="bearer-token"
              type="password"
              className="input"
              placeholder="Tu token de seguridad"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setTested(false);
              }}
            />
            <p className="form-hint">
              Configurado en Network Control → Settings.
            </p>
          </div>

          {tested && testResult !== null && (
            <div
              className={`connection-result fade-in ${testResult ? "success" : "error"}`}
            >
              <span
                className={`status-dot ${testResult ? "connected" : "disconnected"}`}
              />
              {testResult
                ? "Conexión exitosa con Virtual DJ"
                : "No se pudo conectar. Verifica la URL y el token."}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={isCheckingConnection || !url.trim()}
              style={{ flex: 1 }}
            >
              {isCheckingConnection ? (
                <>
                  <span className="spinner" /> Probando…
                </>
              ) : (
                "Probar conexión"
              )}
            </button>

            {tested && testResult && (
              <button
                type="button"
                className="btn btn-primary fade-in"
                onClick={handleContinue}
                style={{ flex: 1 }}
              >
                Ir al panel →
              </button>
            )}
          </div>
        </form>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "var(--accent-soft)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          <strong>Requisitos:</strong>
          <ol style={{ paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
            <li>
              Activa el plugin <strong>Network Control</strong> en Virtual DJ
              (Config → Extensions → Effects → Other).
            </li>
            <li>
              Configura un puerto fijo (ej. 8080) y marca{" "}
              <code className="mono">native_Network Control.ini</code> como
              solo lectura.
            </li>
            <li>
              Ejecuta{" "}
              <code className="mono">ngrok http 8080</code> en tu terminal.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
