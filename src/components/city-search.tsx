'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import type { City } from '@/lib/types';

/**
 * Debounced city autocomplete. Fetches through the server `/api/cities` route so the secret key stays server-side. Emits the selected {@link City} (with `latitude`, `longitude`, and `utcOffset`) to the parent, which feeds it into a chart or panchang request.
 */
export function CitySearch({
  onSelect,
  defaultValue = '',
}: {
  onSelect: (city: City) => void;
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(value)}`);
        const cities: City[] = await res.json();
        setResults(cities);
        setOpen(cities.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(city: City) {
    setQuery(`${city.city}, ${city.country}`);
    setOpen(false);
    onSelect(city);
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder="Search city..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {results.map((city, i) => (
            <button
              key={`${city.city}-${city.iso2}-${i}`}
              type="button"
              className="w-full px-3 py-2 text-left text-sm first:rounded-t-md last:rounded-b-md hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelect(city)}
            >
              <span className="font-medium">{city.city}</span>
              <span className="text-muted-foreground">
                {city.province ? `, ${city.province}` : ''}, {city.country}
              </span>
              <span className="float-right text-xs text-muted-foreground">
                UTC{city.utcOffset >= 0 ? '+' : ''}
                {city.utcOffset}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
