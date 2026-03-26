# AVANCES — VirtualDJ Remote Control

| Fecha | Hito / Cambio | Archivos Afectados | Siguiente Paso |
| :--- | :--- | :--- | :--- |
| 21/03 | Scaffolding Next.js 16 + App Router | `package.json`, `tsconfig.json`, `app/layout.tsx` | Implementar API proxy |
| 21/03 | Tipos TypeScript centrales | `lib/types.ts` | Implementar vdj-client |
| 21/03 | Helper VDJ client (query/execute/ping) | `lib/vdj-client.ts` | Implementar store |
| 21/03 | Store Zustand (conexión, búsqueda, automix) | `lib/store.ts` | Implementar API routes |
| 21/03 | Route Handler proxy VDJ (/api/vdj) | `app/api/vdj/route.ts` | Implementar proxy Deezer |
| 21/03 | Route Handler proxy Deezer (/api/deezer) | `app/api/deezer/route.ts` | Implementar UI |
| 21/03 | CSS global — diseño limpio minimalista | `app/globals.css` | Crear componentes |
| 21/03 | Pantalla configuración ngrok + token | `app/setup/page.tsx` | Crear dashboard |
| 21/03 | Componentes: ConnectionStatus, SearchBar, TrackCard, AutomixQueue | `components/*.tsx` | Dashboard |
| 21/03 | Dashboard principal con buscador + cola automix | `app/dashboard/page.tsx` | Verificar build |
| 22/03 | Fix: carga de Deezer vía URL completa (link) | `lib/store.ts` | Probar si VDJ la acepta |
| 22/03 | Fix: carga de Deezer (prefijo deezer:ID) | `lib/store.ts` | Verificar carga en VDJ |
| 24/03 | Fix: búsqueda VDJ usa browser_scroll (no get_browsed_song con índice) | `lib/store.ts` | Probar búsqueda local |
| 24/03 | Fix: Deezer→automix usa browser_gotofolder+search+automix_add_next | `lib/store.ts` | Probar con VDJ activo |
| 24/03 | Fix: loadTrackToDeck Deezer usa browser_gotofolder+deck N load | `lib/store.ts`, `lib/types.ts` | Verificar en producción |
| 25/03 | Debug console para probar comandos VDJ en vivo | `app/debug/page.tsx` | Probar con VDJ activo |
| 25/03 | Fix: ruta Deezer → `browser_gotofolder "Online Music/Deezer"` | `lib/store.ts` | Probar con VDJ |
| 25/03 | Logging dbg() en store para diagnóstico desde consola browser | `lib/store.ts` | Depurar comandos |
| 25/03 | **FIX DEFINITIVO**: comillas dobles para params (`"title"` no `'title'`) | `lib/store.ts` | Probado OK |
| 25/03 | **FIX DEFINITIVO**: `search 'texto'` en vez de `browser_search` | `lib/store.ts` | Probado OK |
| 25/03 | **FIX DEFINITIVO**: `browser_gotofolder "Deezer"` (sin prefijo) | `lib/store.ts` | Probado OK |
| 25/03 | Header `ngrok-skip-browser-warning` en proxy VDJ | `app/api/vdj/route.ts` | Evita interceptación ngrok |
| 25/03 | Fix: añadir al final (`playlist_add`) en vez de siguiente | `lib/store.ts` | Cola de Automix funcional |
| 25/03 | **Fix bug**: indentación rota en addToQueue pistas locales | `lib/store.ts` | Probado OK con Deezer |
| 25/03 | Retry strategy Deezer: título → artista+palabra → artista | `lib/store.ts` | Para artistas poco populares |
| 25/03 | **Solución cola al final**: clear + re-add en orden inverso | `lib/store.ts` | Cola local + reconstrucción VDJ |
| 25/03 | Limitación VDJ API: ciertos tracks Deezer no se agregan vía API | Diagnóstico | Funciona visualmente pero no vía script |
| 25/03 | **Mejora**: Añadir nativamente al FINAL de la cola | `lib/store.ts` | Uso de `playlist_add` con fallback a `automix_add_next` |
| 25/03 | Fix Foco VDJ: Focus forzado para resultados de red Deezer | `lib/store.ts` | Hack `action_macro 'tab'` para seleccionar canción |
| 25/03 | **Precisión Búsqueda**: Fallback a iteración + verificación | `lib/store.ts` | Algoritmo match "Artista + Título" evita colisiones ("Maria") |
| 25/03 | **Unificación buscador**: Eliminación de tabs VDJ/Deezer | `lib/store.ts` | Interfaz única; VDJ resuelve prioridad local al añadir |
