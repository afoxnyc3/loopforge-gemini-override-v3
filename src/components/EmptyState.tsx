import React from 'react';

interface EmptyStateProps {
  onExampleSearch: (city: string) => void;
}

const EXAMPLE_CITIES = ['London', 'Tokyo', 'New York', 'Sydney', 'Paris'];

export function EmptyState({ onExampleSearch }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20
                      flex items-center justify-center">
        <svg
          className="w-12 h-12 text-blue-400/60"
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
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white/80 mb-2">Check the Weather</h2>
        <p className="text-white/50 text-sm max-w-sm">
          Search for any city to get real-time weather data and a 5-day forecast.
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-white/40 text-xs uppercase tracking-wide">Try these cities</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_CITIES.map(city => (
            <button
              key={city}
              onClick={() => onExampleSearch(city)}
              className="px-3 py-1.5 text-sm text-white/70 hover:text-white
                         bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30
                         rounded-full transition-all duration-200 focus:outline-none
                         focus:ring-2 focus:ring-blue-400"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
