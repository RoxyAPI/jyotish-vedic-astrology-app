// Adapter: Pure location resolution function from src/lib/location.ts
// Source of truth is always src/lib/location.ts.
// NOTE: todayString() uses Date.now() so it's non-deterministic.
// resolveDateAndLocation falls back to todayString(), so we must use
// inputs that include an explicit 'date' param to avoid non-determinism.

const DEFAULT_CITY = {
  label: 'Mumbai, India',
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 5.5,
};

/** Resolve date and location from URL search params, falling back to defaults. */
export function resolveDateAndLocation(params) {
  const num = (key, fallback) => {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = value === undefined ? Number.NaN : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const str = (key, fallback) => {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value ?? fallback;
  };

  return {
    date: str('date', '2026-01-15'),  // fixed fallback instead of todayString()
    label: str('label', DEFAULT_CITY.label),
    coords: {
      latitude: num('lat', DEFAULT_CITY.latitude),
      longitude: num('lon', DEFAULT_CITY.longitude),
      timezone: num('tz', DEFAULT_CITY.timezone),
    },
  };
}
