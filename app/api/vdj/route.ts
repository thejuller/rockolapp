import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, script } = body;
    const ngrokUrl = process.env.VDJ_NGROK_URL;
    const bearerToken = process.env.VDJ_TOKEN;

    if (!action || !script) {
      return NextResponse.json(
        { ok: false, error: "Faltan parámetros: action, script" },
        { status: 400 }
      );
    }

    if (!ngrokUrl) {
      return NextResponse.json(
        { ok: false, error: "Configuración del servidor incompleta (VDJ_NGROK_URL)" },
        { status: 500 }
      );
    }

    if (action !== "query" && action !== "execute") {
      return NextResponse.json(
        { ok: false, error: 'action debe ser "query" o "execute"' },
        { status: 400 }
      );
    }

    // Limpiar URL base
    const baseUrl = ngrokUrl.replace(/\/+$/, "");
    const url = `${baseUrl}/${action}?script=${encodeURIComponent(script)}`;

    // Log server-side para depuración
    console.log(`[VDJ Proxy] ${action}: ${script}`);
    console.log(`[VDJ Proxy] URL: ${url}`);

    const headers: Record<string, string> = {
      // Necesario para que ngrok free no intercepte con su página de advertencia
      "ngrok-skip-browser-warning": "true",
    };
    if (bearerToken) {
      headers["Authorization"] = `Bearer ${bearerToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `VDJ respondió con status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.text();
    console.log(`[VDJ Proxy] Response: ${data.substring(0, 200)}`);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
