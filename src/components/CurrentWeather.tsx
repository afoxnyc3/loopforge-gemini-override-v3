import React from 'react';
import type { CurrentWeatherData } from '../types/weather';
import { getWeatherIconUrl } from '../services/weatherApi';
import {
  formatTime,
  formatVisibility,
  getWindDirection,
  capitalize,
} from '../utils/weatherUtils';

interface CurrentWeatherProps {
  data: CurrentWeatherData;
  unit: 'C' | 'F';
  onUnitToggle: () => void;
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wide">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-white font-semibold text-lg">{value}</p>
    </div>
  );
}

export function CurrentWeather({ data, unit, onUnitToggle }: CurrentWeatherProps) {
  const displayTemp = unit === 'C'
    ? `${Math.round(data.temperature)}°C`
    : `${Math.round((data.temperature * 9) / 5 + 32)}°F`;

  const displayFeelsLike = unit === 'C'
    ? `${Math.round(data.feelsLike)}°C`
    : `${Math.round((data.feelsLike * 9) / 5 + 32)}°F`;

  const sunrise = formatTime(data.sunrise, data.timezone);
  const sunset = formatTime(data.sunset, data.timezone);

  return (
    <div className="card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white text-shadow">
            {data.city}, <span className="text-white/70">{data.country}</span>
          </h2>
          <p className="text-white/50 text-sm mt-0.5">
            {new Date(data.dt * 1000).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={onUnitToggle}
          className="text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40
                     px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2
                     focus:ring-blue-400"
          aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
        >
          °{unit === 'C' ? 'F' : 'C'}
        </button>
      </div>

      {/* Main temp + icon */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={getWeatherIconUrl(data.icon, '4x')}
          alt={data.description}
          className="w-20 h-20 drop-shadow-lg"
          loading="lazy"
        />
        <div>
          <p className="text-6xl font-thin text-white text-shadow">{displayTemp}</p>
          <p className="text-white/70 text-base mt-1 capitalize">{capitalize(data.description)}</p>
          <p className="text-white/50 text-sm">Feels like {displayFeelsLike}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Humidity"
          value={`${data.humidity}%`}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1m20 0h1M4.22 19.778l.707-.707M18.364 5.636l.707-.707" />
            </svg>
          }
        />
        <StatCard
          label="Wind"
          value={`${data.windSpeed} m/s ${getWindDirection(data.windDirection)}`}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
        />
        <StatCard
          label="Pressure"
          value={`${data.pressure} hPa`}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          label="Visibility"
          value={formatVisibility(data.visibility)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
      </div>

      {/* Sunrise/Sunset */}
      <div className="mt-4 flex items-center gap-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06-1.06L5.636 3.515a.75.75 0 10-1.06 1.061l1.59 1.59z" />
          </svg>
          <span>Sunrise: {sunrise}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
          </svg>
          <span>Sunset: {sunset}</span>
        </div>
      </div>
    </div>
  );
}
