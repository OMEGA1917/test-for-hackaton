import { CURRENCIES, COUNTRY_CURRENCY_MAP } from '@/lib/constants';
import type { CurrencyCode } from '@/types';

export function getCurrencySymbol(code: CurrencyCode): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol ?? code;
}

export function getCurrencyForCountry(country: string): CurrencyCode {
  return COUNTRY_CURRENCY_MAP[country] ?? 'USD';
}

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'USD',
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${symbol}${formattedAmount}`;
}

export function formatDimensions(width: number | null, height: number | null): string {
  if (width == null && height == null) return '—';
  if (width == null) return `${height}m`;
  if (height == null) return `${width}m`;
  return `${width}m × ${height}m`;
}

export function formatLocation(city: string | null, country: string | null): string {
  if (!city && !country) return 'Location not specified';
  if (city && country) return `${city}, ${country}`;
  return city || country || '';
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a Date as a local-time YYYY-MM-DD string.
 * Avoids the UTC shift in `toISOString().split('T')[0]`.
 */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks if a date is in the past or already booked.
 * @param date The date to check
 * @param bookedDateStrings Array of date-only strings (e.g., ['2026-10-15'])
 */
export const isDateDisabled = (
  date: Date,
  bookedDateStrings: string[],
): boolean => {
  if (Number.isNaN(date.getTime())) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  if (day < today) return true;

  return bookedDateStrings.includes(toLocalDateString(day));
};

/**
 * Builds a reusable predicate with the booked dates indexed in a Set.
 * Prefer this when rendering a calendar (30+ cells) to avoid O(n) scans.
 */
export const makeIsDateDisabled =
(bookedDateStrings: string[]) => {
  const booked = new Set(bookedDateStrings);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (date: Date): boolean => {
    if (Number.isNaN(date.getTime())) return true;

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    if (day < today) return true;

    return booked.has(toLocalDateString(day));
  };
};
