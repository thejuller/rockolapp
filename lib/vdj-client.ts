import type { VdjProxyResponse } from "./types";

/**
 * Ejecuta un query VDJScript a través del proxy /api/vdj
 */
export async function vdjQuery(
  script: string
): Promise<VdjProxyResponse> {
  const res = await fetch("/api/vdj", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "query", script }),
  });
  return res.json();
}

/**
 * Ejecuta un comando VDJScript a través del proxy /api/vdj
 */
export async function vdjExecute(
  script: string
): Promise<VdjProxyResponse> {
  const res = await fetch("/api/vdj", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "execute", script }),
  });
  return res.json();
}

/**
 * Ping al VDJ para verificar conexión
 */
export async function vdjPing(): Promise<boolean> {
  try {
    const result = await vdjQuery("get_clock");
    return result.ok;
  } catch {
    return false;
  }
}
