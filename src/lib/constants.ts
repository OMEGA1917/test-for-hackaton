import type {
  BillboardType,
  BillboardLighting,
  BillboardStatus,
  PricingPeriod,
  BookingStatus,
  CurrencyCode,
} from '@/types';

export const BILLBOARD_TYPES: { value: BillboardType; label: string }[] = [
  { value: 'static', label: 'Static' },
  { value: 'digital', label: 'Digital' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'poster', label: 'Poster' },
];

export const BILLBOARD_LIGHTING: { value: BillboardLighting; label: string }[] = [
  { value: 'none', label: 'No Lighting' },
  { value: 'frontlit', label: 'Front-lit' },
  { value: 'backlit', label: 'Back-lit' },
];

export const BILLBOARD_STATUSES: { value: BillboardStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
];

export const PRICING_PERIODS: { value: PricingPeriod; label: string }[] = [
  { value: 'day', label: 'Per Day' },
  { value: 'week', label: 'Per Week' },
  { value: 'month', label: 'Per Month' },
];

export const BOOKING_STATUSES: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const CURRENCIES: {
  code: CurrencyCode;
  symbol: string;
  label: string;
}[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'title', label: 'Title (A-Z)' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  'United States': 'USD',
  'India': 'INR',
  'United Kingdom': 'GBP',
  'Germany': 'EUR',
  'France': 'EUR',
  'Spain': 'EUR',
  'Italy': 'EUR',
  'Netherlands': 'EUR',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Singapore': 'SGD',
  'United Arab Emirates': 'AED',
};
