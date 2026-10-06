/** "₹21,49,036" → 2149036. Throws on text with no digits so bad reads fail loudly. */
export function parseCurrency(text: string | null): number {
  const digits = (text ?? '').replace(/[^\d.-]/g, '');
  if (!digits) throw new Error(`Not a currency value: "${text}"`);
  return Number(digits);
}

/** "25L" → 2500000, "1.5Cr" → 15000000, "75000" → 75000 (Indian shorthand used in feature files). */
export function parseAmount(text: string): number {
  const match = text.trim().match(/^([\d.]+)\s*(L|Lakh|Cr|Crore|K)?$/i);
  if (!match) throw new Error(`Unrecognised amount: "${text}"`);
  const multiplier: Record<string, number> = { l: 1e5, lakh: 1e5, cr: 1e7, crore: 1e7, k: 1e3 };
  return Math.round(Number(match[1]) * (match[2] ? multiplier[match[2].toLowerCase()] : 1));
}
