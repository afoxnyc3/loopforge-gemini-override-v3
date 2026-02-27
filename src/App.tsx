import React, { useState, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { ForecastList } from './components/ForecastList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { EmptyState } from './components/EmptyState';
import { useWeather } from './hooks/useWeather';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const { current, forecast, loading, error, search, clearError } = useWeather();
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', []);
  const [lastQuery, setLastQuery] = useState<string>('');

  const handleSearch = useCallback(
    (city: string) => {
      setLastQuery(city);
      search(city);
      setRecentSearches(prev => {
        const filtered = prev.filter(c => c.toLowerCase() !== city.toLowerCase());
        return [city, ...filtered].slice(0, 10);
      });
    },
    [search, setRecentSearches]
  );

  const handleRetry = useCallback(() => {
    if (lastQuery) {
      clearError();
      search(lastQuery);
    }
  }, [lastQuery, clearError, search]);

  const toggleUnit = useCallback(() => {
    setUnit(prev => (prev === 'C' ? 'F' : 'C'));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg
              className="w-8 h-8 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            <h1 className="text-3xl font-bold text-white text-shadow">Weather Dashboard</h1>
          </div>
          <p className="text-white/50 text-sm">Real-time weather data powered by OpenWeatherMap</p>
        </header>

        {/* Search */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            loading={loading}
            recentSearches={recentSearches}
          />
        </div>

        {/* Content area */}
        <main>
          {loading && <LoadingSpinner />}

          {!loading && error && (
            <ErrorMessage
              message={error}
              onRetry={lastQuery ? handleRetry : undefined}
              onDismiss={clearError}
            />
          )}

          {!loading && !error && !current && (
            <EmptyState onExampleSearch={handleSearch} />
          )}

          {!loading && !error && current && (
            <div className="flex flex-col gap-6">
              <CurrentWeather
                data={current}
                unit={unit}
                onUnitToggle={toggleUnit}
              />
              {forecast && (
                <ForecastList data={forecast} unit={unit} />
              )}
              {/* Last updated */}
              <p className="text-center text-white/30 text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
