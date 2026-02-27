import React from 'react';
import type { ForecastEntry } from '../types/weather';
import { getWeatherIconUrl } from '../services/weatherApi';
import { formatDayName, formatDate, formatPop, capitalize } from '../utils/weatherUtils';

interface ForecastCardProps {
  entry: ForecastEntry;
  unit: 'C' | 'F';
  isToday?: boolean;
}

function convertTemp(celsius: number, unit: 'C' | 'F'): number {
  return unit === 'C' ? Math.round(celsius) : Math.round((celsius * 9) / 5 + 32);
}

export function ForecastCard({ entry, unit, isToday = false }: ForecastCardProps) {
  const maxTemp = convertTemp(entry.temperature.max, unit);
  const minTemp = convertTemp(entry.temperature.min, unit);
  const unitSymbol = unit === 'C' ? '°C' : '°F';

  return (
    <div
      className={`card p-4 flex flex-col items-center gap-2 transition-transform hover:scale-105 hover:bg-white/15
                  ${ isToday ? 'border-blue-400/50 bg-blue-500/10' : '' }`}
      aria-label={`Forecast for ${formatDayName(entry.dt)}: ${capitalize(entry.description)}, high ${maxTemp}${unitSymbol}, low ${minTemp}${unitSymbol}`}
    >
      {/* Day */}
      <p className={`font-semibold text-sm ${ isToday ? 'text-blue-300' : 'text-white/80' }`}>
        {isToday ? 'Today' : formatDayName(entry.dt)}
      </p>
      <p className="text-white/40 text-xs">{formatDate(entry.dt)}</p>

      {/* Icon */}
      <img
        src={getWeatherIconUrl(entry.icon, '2x')}
        alt={entry.description}
        className="w-12 h-12 drop-shadow"
        loading="lazy"
      />

      {/* Description */}
      <p className="text-white/60 text-xs text-center capitalize">{capitalize(entry.description)}</p>

      {/* Temp range */}
      <div className="flex items-center gap-1 text-sm">
        <span className="text-white font-semibold">{maxTemp}{unitSymbol}</span>
        <span className="text-white/40">/</span>
        <span className="text-white/50">{minTemp}{unitSymbol}</span>
      </div>

      {/* Precipitation probability */}
      {entry.pop > 0.1 && (
        <div className="flex items-center gap-1 text-xs text-blue-300">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.6.3l7.5 10a.75.75 0 01-.6 1.2h-15a.75.75 0 01-.6-1.2l7.5-10a.75.75 0 01.6-.3z" />
          </svg>
          <span>{formatPop(entry.pop)}</span>
        </div>
      )}

      {/* Wind */}
      <p className="text-white/40 text-xs">{entry.windSpeed} m/s</p>
    </div>
  );
}
