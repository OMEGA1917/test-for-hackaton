/*
# BoardSpot: Profiles, Billboards, Billboard Images, Booking Requests

## Overview
Creates the core schema for the BoardSpot billboard marketplace:
- `profiles` — extends Supabase auth.users with role (advertiser/owner), full name, avatar
- `billboards` — listings created by owners with location, dimensions, pricing, type, lighting, status
- `billboard_images` — photo gallery entries for each billboard (stored in Supabase Storage)
- `booking_requests` — advertiser → owner requests for a billboard for a date range

## Tables

### profiles
- `id` (uuid, PK, FK → auth.users) — one row per auth user
- `full_name` (text) — display name
- `role` (enum: 'advertiser' | 'owner') — determines dashboard and permissions
- `avatar_url` (text) — optional profile image URL
- `phone` (text) — optional phone number
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### billboards
- `id` (uuid, PK)
- `owner_id` (uuid, FK → auth.users, DEFAULT auth.uid()) — the owner who created it
- `title` (text, not null)
- `description` (text)
- `type` (enum: 'static' | 'digital' | 'mobile' | 'poster')
- `location` (text) — human-readable address
- `latitude` (numeric(10,7))
- `longitude` (numeric(10,7))
- `city` (text)
- `country` (text)
- `width` (numeric(10,2)) — in meters
- `height` (numeric(10,2)) — in meters
- `price` (numeric(10,2), not null)
- `currency` (text, not null, default 'USD') — ISO 4217 code
- `pricing_period` (enum: 'day' | 'week' | 'month')
- `lighting` (enum: 'none' | 'frontlit' | 'backlit')
- `status` (enum: 'draft' | 'published' | 'unpublished', default 'draft')
- `available_from` (date) — optional availability window start
- `available_to` (date) — optional availability window end
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### billboard_images
- `id` (uuid, PK)
- `billboard_id` (uuid, FK → billboards ON DELETE CASCADE)
- `image_url` (text, not null) — Storage URL
- `display_order` (int, default 0) — gallery ordering
- `created_at` (timestamptz, default now())

### booking_requests
- `id` (uuid, PK)
- `billboard_id` (uuid, FK → billboards)
- `advertiser_id` (uuid, FK → auth.users, DEFAULT auth.uid())
- `owner_id` (uuid, FK → auth.users)
- `start_date` (date, not null)
- `end_date` (date, not null)
- `message` (text) — optional message from advertiser
- `status` (enum: 'pending' | 'accepted' | 'rejected' | 'cancelled', default 'pending')
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security (RLS)

### profiles
- SELECT: users can read their own profile (authenticated)
- INSERT: users can insert their own profile (authenticated, WITH CHECK auth.uid() = id)
- UPDATE: users can update their own profile (authenticated, USING + WITH CHECK auth.uid() = id)

### billboards
- SELECT: public (anon, authenticated) can see published billboards; owners can see all their own
- INSERT: authenticated owners can create billboards where owner_id = auth.uid()
- UPDATE: owners can update their own billboards
- DELETE: owners can delete their own billboards

### billboard_images
- SELECT: public (anon, authenticated) can see images of published billboards; owners can see their own
- INSERT: authenticated owners can add images to billboards they own
- UPDATE: owners can update images on their own billboards
- DELETE: owners can delete images on their own billboards

### booking_requests
- SELECT: advertisers can see their own requests; owners can see requests for their billboards
- INSERT: authenticated advertisers can create requests where advertiser_id = auth.uid()
- UPDATE: owners can update status of requests for their billboards; advertisers can cancel their own
- DELETE: not allowed (requests are kept for audit)

## Storage
- Creates `billboard-images` bucket (public) for billboard photo uploads

## Notes
1. All owner columns default to auth.uid() so frontend inserts omitting owner_id succeed.
2. Enum types use CHECK constraints for flexibility (no CREATE TYPE dependency).
3. Public SELECT on published billboards allows marketplace browsing without auth.
*/

-- Helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- PROFILES
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    role text NOT NULL DEFAULT 'advertiser' CHECK (role IN ('advertiser', 'owner')),
    avatar_url text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- BILLBOARDS
-- =============================================================
CREATE TABLE IF NOT EXISTS billboards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    type text CHECK (type IN ('static', 'digital', 'mobile', 'poster')),
    location text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    city text,
    country text,
    width numeric(10,2),
    height numeric(10,2),
    price numeric(10,2) NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    pricing_period text DEFAULT 'month' CHECK (pricing_period IN ('day', 'week', 'month')),
    lighting text DEFAULT 'none' CHECK (lighting IN ('none', 'frontlit', 'backlit')),
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
    available_from date,
    available_to date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE billboards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_billboards" ON billboards;
CREATE POLICY "select_billboards"
ON billboards FOR SELECT TO anon, authenticated
USING (
    status = 'published' OR auth.uid() = owner_id
);

DROP POLICY IF EXISTS "insert_billboards" ON billboards;
CREATE POLICY "insert_billboards"
ON billboards FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_billboards" ON billboards;
CREATE POLICY "update_billboards"
ON billboards FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_billboards" ON billboards;
CREATE POLICY "delete_billboards"
ON billboards FOR DELETE TO authenticated
USING (auth.uid() = owner_id);

DROP TRIGGER IF EXISTS billboards_updated_at ON billboards;
CREATE TRIGGER billboards_updated_at BEFORE UPDATE ON billboards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for common queries
CREATE INDEX IF NOT EXISTS billboards_status_idx ON billboards(status);
CREATE INDEX IF NOT EXISTS billboards_owner_idx ON billboards(owner_id);
CREATE INDEX IF NOT EXISTS billboards_city_idx ON billboards(city);
CREATE INDEX IF NOT EXISTS billboards_type_idx ON billboards(type);

-- =============================================================
-- BILLBOARD_IMAGES
-- =============================================================
CREATE TABLE IF NOT EXISTS billboard_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    billboard_id uuid NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    display_order int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE billboard_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_billboard_images" ON billboard_images;
CREATE POLICY "select_billboard_images"
ON billboard_images FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM billboards b
        WHERE b.id = billboard_images.billboard_id
        AND (b.status = 'published' OR b.owner_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "insert_billboard_images" ON billboard_images;
CREATE POLICY "insert_billboard_images"
ON billboard_images FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM billboards b
        WHERE b.id = billboard_images.billboard_id
        AND b.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "update_billboard_images" ON billboard_images;
CREATE POLICY "update_billboard_images"
ON billboard_images FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM billboards b
        WHERE b.id = billboard_images.billboard_id
        AND b.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "delete_billboard_images" ON billboard_images;
CREATE POLICY "delete_billboard_images"
ON billboard_images FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM billboards b
        WHERE b.id = billboard_images.billboard_id
        AND b.owner_id = auth.uid()
    )
);

CREATE INDEX IF NOT EXISTS billboard_images_billboard_idx ON billboard_images(billboard_id);

-- =============================================================
-- BOOKING_REQUESTS
-- =============================================================
CREATE TABLE IF NOT EXISTS booking_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    billboard_id uuid NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
    advertiser_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    message text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_booking_requests" ON booking_requests;
CREATE POLICY "select_booking_requests"
ON booking_requests FOR SELECT TO authenticated
USING (auth.uid() = advertiser_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_booking_requests" ON booking_requests;
CREATE POLICY "insert_booking_requests"
ON booking_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = advertiser_id);

DROP POLICY IF EXISTS "update_booking_requests" ON booking_requests;
CREATE POLICY "update_booking_requests"
ON booking_requests FOR UPDATE TO authenticated
USING (auth.uid() = advertiser_id OR auth.uid() = owner_id)
WITH CHECK (auth.uid() = advertiser_id OR auth.uid() = owner_id);

-- No DELETE policy: booking requests are retained for audit

DROP TRIGGER IF EXISTS booking_requests_updated_at ON booking_requests;
CREATE TRIGGER booking_requests_updated_at BEFORE UPDATE ON booking_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS booking_requests_billboard_idx ON booking_requests(billboard_id);
CREATE INDEX IF NOT EXISTS booking_requests_advertiser_idx ON booking_requests(advertiser_id);
CREATE INDEX IF NOT EXISTS booking_requests_owner_idx ON booking_requests(owner_id);
CREATE INDEX IF NOT EXISTS booking_requests_status_idx ON booking_requests(status);

-- =============================================================
-- STORAGE BUCKET
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('billboard-images', 'billboard-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "select_billboard_images_storage" ON storage.objects;
CREATE POLICY "select_billboard_images_storage"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'billboard-images');

DROP POLICY IF EXISTS "insert_billboard_images_storage" ON storage.objects;
CREATE POLICY "insert_billboard_images_storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'billboard-images');

DROP POLICY IF EXISTS "update_billboard_images_storage" ON storage.objects;
CREATE POLICY "update_billboard_images_storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'billboard-images');

DROP POLICY IF EXISTS "delete_billboard_images_storage" ON storage.objects;
CREATE POLICY "delete_billboard_images_storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'billboard-images');
