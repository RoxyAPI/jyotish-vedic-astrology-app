/**
 * The 16 Varga (divisional) charts available in Vedic astrology.
 * Each division analyzes a specific life area. D9 Navamsa (marriage/dharma)
 * is the most commonly used and loaded by default.
 */
export const VARGA_CHARTS = [
  { division: 9, name: 'D9 Navamsa', desc: 'Marriage and dharma' },
  { division: 2, name: 'D2 Hora', desc: 'Wealth' },
  { division: 3, name: 'D3 Drekkana', desc: 'Siblings' },
  { division: 4, name: 'D4 Chaturthamsa', desc: 'Property' },
  { division: 7, name: 'D7 Saptamsa', desc: 'Children' },
  { division: 10, name: 'D10 Dasamsa', desc: 'Career' },
  { division: 12, name: 'D12 Dwadasamsa', desc: 'Parents' },
  { division: 16, name: 'D16 Shodasamsa', desc: 'Vehicles' },
  { division: 20, name: 'D20 Vimsamsa', desc: 'Spirituality' },
  { division: 24, name: 'D24 Chaturvimsamsa', desc: 'Education' },
  { division: 27, name: 'D27 Bhamsa', desc: 'Strengths' },
  { division: 30, name: 'D30 Trimsamsa', desc: 'Misfortunes' },
  { division: 40, name: 'D40 Khavedamsa', desc: 'Maternal legacy' },
  { division: 45, name: 'D45 Akshavedamsa', desc: 'Character' },
  { division: 60, name: 'D60 Shashtiamsa', desc: 'Past karma' },
] as const;
