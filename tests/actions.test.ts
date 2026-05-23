import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Tests for the form-submit Server Actions. The Roxy SDK is mocked, so these run with no network and no real key. They prove the kundali action fans out to every endpoint with the right shape (forwarding `lang` only to the i18n-aware ones) and that the matching action calls Gun Milan.
 */

const vedic = {
  generateBirthChart: vi.fn(),
  generateDivisionalChart: vi.fn(),
  getMajorDashas: vi.fn(),
  checkManglikDosha: vi.fn(),
  checkKalsarpaDosha: vi.fn(),
  checkSadhesati: vi.fn(),
  calculateAshtakavarga: vi.fn(),
  calculateShadbala: vi.fn(),
  calculateGunMilan: vi.fn(),
};

vi.mock('@roxyapi/sdk', () => ({ createRoxy: () => ({ vedicAstrology: vedic }) }));

const birth = { date: '1990-01-15', time: '14:30:00', latitude: 28.6139, longitude: 77.209, timezone: 5.5 };

beforeEach(() => {
  vi.clearAllMocks();
  // The Roxy client freezes `hasApiKey` at import, so reset the registry every test
  // and let each test set the env before its dynamic import.
  vi.resetModules();
  process.env.ROXYAPI_KEY = 'test-key';
  for (const fn of Object.values(vedic)) fn.mockResolvedValue({ data: {}, error: undefined });
});

describe('generateKundali', () => {
  it('fans out to all eight endpoints, forwarding lang only to the i18n-aware ones', async () => {
    vedic.generateBirthChart.mockResolvedValue({ data: { meta: {} }, error: undefined });
    const { generateKundali } = await import('@/app/kundali/actions');

    const result = await generateKundali({ ...birth, lang: 'hi' });

    // i18n-aware endpoints receive the lang query.
    expect(vedic.generateBirthChart).toHaveBeenCalledWith({ query: { lang: 'hi' }, body: birth });
    expect(vedic.getMajorDashas).toHaveBeenCalledWith({ query: { lang: 'hi' }, body: birth });

    // D9 navamsa via the generic divisional chart.
    expect(vedic.generateDivisionalChart).toHaveBeenCalledWith({ body: { ...birth, division: 9 } });

    // Numeric-only endpoints take no lang query.
    expect(vedic.checkManglikDosha).toHaveBeenCalledWith({ body: birth });
    expect(vedic.checkKalsarpaDosha).toHaveBeenCalledWith({ body: birth });
    expect(vedic.checkSadhesati).toHaveBeenCalledWith({ body: birth });
    expect(vedic.calculateAshtakavarga).toHaveBeenCalledWith({ body: birth });
    expect(vedic.calculateShadbala).toHaveBeenCalledWith({ body: birth });

    expect(result.chart).toEqual({ meta: {} });
  });

  it('throws a setup error when the API key is missing', async () => {
    vi.resetModules();
    process.env.ROXYAPI_KEY = '';
    const { generateKundali } = await import('@/app/kundali/actions');
    await expect(generateKundali({ ...birth, lang: 'en' })).rejects.toThrow(/ROXYAPI_KEY is not set/);
  });

  it('throws a code-mapped message when an endpoint returns an error', async () => {
    vedic.calculateShadbala.mockResolvedValue({
      data: undefined,
      error: { error: 'boom', code: 'internal_error' },
    });
    const { generateKundali } = await import('@/app/kundali/actions');
    await expect(generateKundali({ ...birth })).rejects.toThrow('boom');
  });
});

describe('calculateMatch', () => {
  it('calls Gun Milan with both people and forwards lang', async () => {
    vedic.calculateGunMilan.mockResolvedValue({ data: { total: 28 }, error: undefined });
    const { calculateMatch } = await import('@/app/matching/actions');

    const person1 = { ...birth };
    const person2 = { ...birth, date: '1992-03-15' };
    const result = await calculateMatch({ person1, person2, lang: 'es' });

    expect(vedic.calculateGunMilan).toHaveBeenCalledWith({ query: { lang: 'es' }, body: { person1, person2 } });
    expect(result).toEqual({ total: 28 });
  });
});
