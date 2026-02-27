import React, { useState, useRef, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  loading?: boolean;
  recentSearches?: string[];
}

export function SearchBar({ onSearch, loading = false, recentSearches = [] }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed && !loading) {
        onSearch(trimmed);
        setShowSuggestions(false);
      }
    },
    [query, loading, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = query.trim();
        if (trimmed && !loading) {
          onSearch(trimmed);
          setShowSuggestions(false);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    },
    [query, loading, onSearch]
  );

  const handleSuggestionClick = useCallback(
    (city: string) => {
      setQuery(city);
      setShowSuggestions(false);
      onSearch(city);
    },
    [onSearch]
  );

  const filteredSuggestions = recentSearches.filter(
    city => city.toLowerCase().includes(query.toLowerCase()) && city !== query
  );

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-white/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(query.length > 0 && filteredSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Search city (e.g. London, Tokyo)..."
            className="input-field pl-10"
            aria-label="Search for a city"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            autoComplete="off"
            disabled={loading}
          />
          {/* Recent searches dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute top-full mt-1 left-0 right-0 bg-slate-800/95 backdrop-blur-sm
                         border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {filteredSuggestions.slice(0, 5).map(city => (
                <li
                  key={city}
                  role="option"
                  aria-selected={false}
                  onMouseDown={() => handleSuggestionClick(city)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-white/10 flex items-center gap-2
                             text-sm text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary flex items-center gap-2 min-w-[100px] justify-center"
          aria-label="Search weather"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Searching</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>
    </div>
  );
}
