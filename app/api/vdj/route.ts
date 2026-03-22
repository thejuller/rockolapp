import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, script, ngrokUrl, bearerToken } = body;

    if (!action || !script || !ngrokUrl) {
      return NextResponse.json(
        { ok: false, error: "Faltan parámetros: action, script, ngrokUrl" },
        { status: 400 }
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

    const headers: Record<string, string> = {};
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

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
