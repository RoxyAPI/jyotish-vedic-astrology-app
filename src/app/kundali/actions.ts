'use server';

import { roxy } from '@/lib/roxy/client';
import { unwrap } from '@/lib/roxy/guard';
import type { Lang } from '@/lib/lang';
import type { BirthDetails } from '@/lib/types';

export interface BirthInput extends BirthDetails {
  lang?: Lang;
}

/**
 * Fans out one birth input to every kundali endpoint in parallel:
 * D1 birth chart, D9 navamsa (via the generic divisional chart),
 * Vimshottari major dashas, the three doshas, and the two strength analyses.
 * One round trip per endpoint, all concurrent. `lang` is forwarded to the
 * i18n-aware endpoints (birth chart, dashas); the dosha and strength endpoints
 * return only numbers and planet names, so they take no `lang` query.
 */
export async function generateKundali({ date, time, latitude, longitude, timezone, lang }: BirthInput) {
  const body = { date, time, latitude, longitude, timezone };

  const [chart, navamsa, dashas, manglik, kalsarpa, sadhesati, ashtakavarga, shadbala] =
    await Promise.all([
      unwrap(roxy.vedicAstrology.generateBirthChart({ query: { lang }, body })),
      unwrap(roxy.vedicAstrology.generateDivisionalChart({ body: { ...body, division: 9 } })),
      unwrap(roxy.vedicAstrology.getMajorDashas({ query: { lang }, body })),
      unwrap(roxy.vedicAstrology.checkManglikDosha({ body })),
      unwrap(roxy.vedicAstrology.checkKalsarpaDosha({ body })),
      unwrap(roxy.vedicAstrology.checkSadhesati({ body })),
      unwrap(roxy.vedicAstrology.calculateAshtakavarga({ body })),
      unwrap(roxy.vedicAstrology.calculateShadbala({ body })),
    ]);

  return { chart, navamsa, dashas, manglik, kalsarpa, sadhesati, ashtakavarga, shadbala };
}

/** Loads a single divisional (varga) chart on demand. `division` is the integer (9 for navamsa, 10 for dasamsa, up to 60). */
export async function fetchDivisionalChart(input: Omit<BirthInput, 'lang'> & { division: number }) {
  const { date, time, latitude, longitude, timezone, division } = input;
  return unwrap(
    roxy.vedicAstrology.generateDivisionalChart({
      body: { date, time, latitude, longitude, timezone, division },
    }),
  );
}
