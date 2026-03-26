"use client";

import { useAppStore } from "@/lib/store";
import { Search, X, Loader2 } from "lucide-react";
import { FormEvent } from "react";

export function SearchBar() {
  const { searchQuery, setSearchQuery, search, isSearching } = useAppStore();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      search();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="search-container" style={{ padding: "1.25rem" }}>
      <div className="search-input-wrap">
        <div 
          className="search-icon" 
          style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isSearching ? (
            <Loader2 className="spinner" size={20} />
          ) : (
            <Search size={20} />
          )}
        </div>
        
        <input
          type="text"
          className="input"
          placeholder="Busca artistas, géneros o canciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: "3rem", paddingRight: searchQuery ? "3rem" : "1rem" }}
        />

        {searchQuery && !isSearching && (
          <button
            type="button"
            className="btn-ghost"
            onClick={clearSearch}
            aria-label="Limpiar búsqueda"
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isSearching || !searchQuery.trim()}
        style={{ marginTop: "1rem", width: "100%" }}
      >
        {isSearching ? "Buscando..." : "Buscar en la Rokola"}
      </button>
    </form>
  );
}
