'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

export interface CityResult {
  city: string;
  province: string;
  country: string;
  iso2: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffset: number;
}

interface CitySearchProps {
  onSelect: (city: CityResult) => void;
  defaultValue?: string;
}

export function CitySearch({ onSelect, defaultValue = '' }: CitySearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<CityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(value)}`);
        const data: CityResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }

  function handleSelect(city: CityResult) {
    setQuery(`${city.city}, ${city.country}`);
    setIsOpen(false);
    onSelect(city);
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder="Search city..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {results.map((city, i) => (
            <button
              key={`${city.city}-${city.iso2}-${i}`}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground first:rounded-t-md last:rounded-b-md"
              onClick={() => handleSelect(city)}
            >
              <span className="font-medium">{city.city}</span>
              <span className="text-muted-foreground">
                {city.province ? `, ${city.province}` : ''}, {city.country}
              </span>
              <span className="float-right text-xs text-muted-foreground">
                UTC{city.utcOffset >= 0 ? '+' : ''}{city.utcOffset}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
