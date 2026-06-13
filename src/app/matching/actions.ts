'use server';

import { roxy } from '@/lib/roxy/client';
import { unwrap } from '@/lib/roxy/guard';
import type { Lang } from '@/lib/lang';
import type { BirthDetails } from '@/lib/types';

/** Runs 36-point Ashtakoot Gun Milan for two birth charts. The response carries the total score, koota breakdown, and dosha analysis that `RoxyGunaMilan` renders. */
export async function calculateMatch(input: { person1: BirthDetails; person2: BirthDetails; lang?: Lang }) {
  return unwrap(
    roxy.vedicAstrology.calculateGunMilan({
      query: { lang: input.lang },
      body: { person1: input.person1, person2: input.person2 },
    }),
  );
}
