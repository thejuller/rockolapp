import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { ok: false, error: "Parámetro q requerido" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=15`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `Deezer respondió con status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      ok: true,
      results: data.data || [],
      total: data.total || 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
