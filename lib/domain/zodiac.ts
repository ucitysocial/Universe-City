export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export const ZODIAC: Record<ZodiacSign, { symbol: string }> = {
  Aries: { symbol: '♈' },
  Taurus: { symbol: '♉' },
  Gemini: { symbol: '♊' },
  Cancer: { symbol: '♋' },
  Leo: { symbol: '♌' },
  Virgo: { symbol: '♍' },
  Libra: { symbol: '♎' },
  Scorpio: { symbol: '♏' },
  Sagittarius: { symbol: '♐' },
  Capricorn: { symbol: '♑' },
  Aquarius: { symbol: '♒' },
  Pisces: { symbol: '♓' }
};

export const MONTH_SIGNS: Record<number, [ZodiacSign, ZodiacSign]> = {
  1: ['Capricorn', 'Aquarius'],
  2: ['Aquarius', 'Pisces'],
  3: ['Pisces', 'Aries'],
  4: ['Aries', 'Taurus'],
  5: ['Taurus', 'Gemini'],
  6: ['Gemini', 'Cancer'],
  7: ['Cancer', 'Leo'],
  8: ['Leo', 'Virgo'],
  9: ['Virgo', 'Libra'],
  10: ['Libra', 'Scorpio'],
  11: ['Scorpio', 'Sagittarius'],
  12: ['Sagittarius', 'Capricorn']
};

export function zodiacFromDate(month: number, day: number): ZodiacSign {
  const cutoff: Record<number, { day: number; before: ZodiacSign; after: ZodiacSign }> = {
    1: { day: 20, before: 'Capricorn', after: 'Aquarius' },
    2: { day: 19, before: 'Aquarius', after: 'Pisces' },
    3: { day: 21, before: 'Pisces', after: 'Aries' },
    4: { day: 20, before: 'Aries', after: 'Taurus' },
    5: { day: 21, before: 'Taurus', after: 'Gemini' },
    6: { day: 21, before: 'Gemini', after: 'Cancer' },
    7: { day: 23, before: 'Cancer', after: 'Leo' },
    8: { day: 23, before: 'Leo', after: 'Virgo' },
    9: { day: 23, before: 'Virgo', after: 'Libra' },
    10: { day: 23, before: 'Libra', after: 'Scorpio' },
    11: { day: 22, before: 'Scorpio', after: 'Sagittarius' },
    12: { day: 22, before: 'Sagittarius', after: 'Capricorn' }
  };
  const c = cutoff[month];
  if (!c) throw new Error('Invalid birth month');
  return day < c.day ? c.before : c.after;
}
