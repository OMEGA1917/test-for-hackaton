export type UserRole = 'advertiser' | 'owner';

export type BillboardType = 'static' | 'digital' | 'mobile' | 'poster';

export type BillboardLighting = 'none' | 'frontlit' | 'backlit';

export type BillboardStatus = 'draft' | 'published' | 'unpublished';

export type PricingPeriod = 'day' | 'week' | 'month';

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type CurrencyCode = 'USD' | 'INR' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'SGD' | 'AED';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Billboard {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  type: BillboardType | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  width: number | null;
  height: number | null;
  price: number;
  currency: CurrencyCode;
  pricing_period: PricingPeriod;
  lighting: BillboardLighting;
  status: BillboardStatus;
  available_from: string | null;
  available_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillboardImage {
  id: string;
  billboard_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface BillboardWithImages extends Billboard {
  images: BillboardImage[];
  owner?: Profile | null;
}

export interface BookingRequest {
  id: string;
  billboard_id: string;
  advertiser_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingRequestWithDetails extends BookingRequest {
  billboard?: Pick<Billboard, 'id' | 'title' | 'city' | 'country' | 'price' | 'currency'> | null;
  advertiser?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
}
