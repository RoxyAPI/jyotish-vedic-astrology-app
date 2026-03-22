import { locationApi } from '@/api/location-client';
import { hasApiKey } from '@/api/check-key';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (!hasApiKey()) {
    return NextResponse.json([], { status: 503 });
  }

  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const { data, error } = await locationApi.GET('/search', {
    params: { query: { q, limit: 8 } },
  });

  if (error) {
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
