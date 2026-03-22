"use client";

import { useRef, useCallback, FormEvent } from "react";
import { useAppStore } from "@/lib/store";

export function SearchBar() {
  const {
    searchQuery,
    searchSource,
    isSearching,
    setSearchQuery,
    setSearchSource,
    search,
  } = useAppStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (value.trim()) {
          search();
        }
      }, 350);
    },
    [setSearchQuery, search]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    search();
  };

  return (
    <div className="search-container">
      <div className="tabs">
        <button
          className={`tab ${searchSource === "deezer" ? "active" : ""}`}
          onClick={() => setSearchSource("deezer")}
          type="button"
        >
          🎵 Deezer
        </button>
        <button
          className={`tab ${searchSource === "vdj" ? "active" : ""}`}
          onClick={() => setSearchSource("vdj")}
          type="button"
        >
          💿 Biblioteca VDJ
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="search-input"
            type="text"
            className="input"
            placeholder={
              searchSource === "deezer"
                ? "Buscar en Deezer…"
                : "Buscar en tu biblioteca VDJ…"
            }
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            autoComplete="off"
          />
        </div>
        {isSearching && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.75rem",
              color: "var(--text-muted)",
              fontSize: "0.8125rem",
            }}
          >
            <span className="spinner" /> Buscando…
          </div>
        )}
      </form>
    </div>
  );
}
