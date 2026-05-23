import { type NextRequest, NextResponse } from 'next/server';
import { hasApiKey, roxy } from '@/lib/roxy/client';

/**
 * Server-side city search proxy. The secret `ROXYAPI_KEY` never reaches the browser, so the client `CitySearch` component fetches through this handler instead of calling the API directly.
 *
 * @remarks `roxy.location.searchCities` resolves to `{ cities: [...] }`, so this returns `data.cities`, not the envelope.
 */
export async function GET(request: NextRequest) {
  if (!hasApiKey) return NextResponse.json([], { status: 503 });

  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) return NextResponse.json([]);

  const { data, error } = await roxy.location.searchCities({ query: { q, limit: 8 } });
  if (error) return NextResponse.json([], { status: 500 });

  return NextResponse.json(data?.cities ?? []);
}
