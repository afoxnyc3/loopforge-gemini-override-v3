import React from 'react';
import type { ForecastData } from '../types/weather';
import { ForecastCard } from './ForecastCard';

interface ForecastListProps {
  data: ForecastData;
  unit: 'C' | 'F';
}

export function ForecastList({ data, unit }: ForecastListProps) {
  if (!data.list || data.list.length === 0) {
    return null;
  }

  return (
    <section aria-label="5-day weather forecast" className="animate-slide-up">
      <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {data.list.map((entry, index) => (
          <ForecastCard
            key={entry.dt}
            entry={entry}
            unit={unit}
            isToday={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
