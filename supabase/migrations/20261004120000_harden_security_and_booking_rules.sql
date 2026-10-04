-- ==============================================================================
-- PROFILES TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    CASE
      WHEN new.raw_user_meta_data->>'role' IN ('advertiser','owner')
        THEN new.raw_user_meta_data->>'role'
      ELSE 'advertiser'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- TIGHTENED BOOKING_REQUEST POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "select_booking_requests" ON public.booking_requests;
DROP POLICY IF EXISTS "insert_booking_requests" ON public.booking_requests;
DROP POLICY IF EXISTS "update_booking_requests" ON public.booking_requests;

CREATE POLICY "advertisers_select_own_requests"
ON public.booking_requests FOR SELECT TO authenticated
USING (auth.uid() = advertiser_id);

CREATE POLICY "owners_select_requests_for_their_billboards"
ON public.booking_requests FOR SELECT TO authenticated
USING (
  auth.uid() = owner_id
  OR EXISTS (
    SELECT 1 FROM public.billboards b
    WHERE b.id = booking_requests.billboard_id
      AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "advertisers_insert_requests"
ON public.booking_requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = advertiser_id
  AND owner_id <> auth.uid()
  AND start_date <= end_date
  AND EXISTS (
    SELECT 1 FROM public.billboards b
    WHERE b.id = booking_requests.billboard_id
      AND b.status = 'published'
      AND b.owner_id = booking_requests.owner_id   -- prevents owner_id spoofing
  )
);

CREATE POLICY "participants_update_requests"
ON public.booking_requests FOR UPDATE TO authenticated
USING  (auth.uid() = advertiser_id OR auth.uid() = owner_id)
WITH CHECK (auth.uid() = advertiser_id OR auth.uid() = owner_id);

-- Column-level enforcement (RLS can't do this alone)
CREATE OR REPLACE FUNCTION public.enforce_booking_request_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.billboard_id <> OLD.billboard_id
     OR NEW.advertiser_id <> OLD.advertiser_id
     OR NEW.owner_id <> OLD.owner_id
     OR NEW.start_date <> OLD.start_date
     OR NEW.end_date <> OLD.end_date THEN
    RAISE EXCEPTION 'Booking request terms are immutable';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF auth.uid() = OLD.advertiser_id THEN
      IF NEW.status <> 'cancelled' THEN
        RAISE EXCEPTION 'Advertisers may only cancel a request';
      END IF;
    ELSIF auth.uid() = OLD.owner_id THEN
      IF NEW.status NOT IN ('accepted','rejected') THEN
        RAISE EXCEPTION 'Owners may only accept or reject a request';
      END IF;
    ELSE
      RAISE EXCEPTION 'Not authorized';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_requests_enforce_update ON public.booking_requests;
CREATE TRIGGER booking_requests_enforce_update
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_request_update();

-- ==============================================================================
-- TIGHTENED STORAGE POLICIES (per-user folder)
-- ==============================================================================
DROP POLICY IF EXISTS "insert_billboard_images_storage" ON storage.objects;
CREATE POLICY "insert_billboard_images_storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'billboard-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "update_billboard_images_storage" ON storage.objects;
CREATE POLICY "update_billboard_images_storage"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'billboard-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'billboard-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "delete_billboard_images_storage" ON storage.objects;
CREATE POLICY "delete_billboard_images_storage"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'billboard-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ==============================================================================
-- BOOKING INSERT: must start as 'pending', dates must fall inside availability
-- ==============================================================================
DROP POLICY IF EXISTS "advertisers_insert_requests" ON public.booking_requests;
CREATE POLICY "advertisers_insert_requests"
ON public.booking_requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = advertiser_id
  AND status = 'pending'
  AND owner_id <> auth.uid()
  AND start_date <= end_date
  AND EXISTS (
    SELECT 1 FROM public.billboards b
    WHERE b.id = booking_requests.billboard_id
      AND b.status = 'published'
      AND b.owner_id = booking_requests.owner_id
      AND (b.available_from IS NULL OR booking_requests.start_date >= b.available_from)
      AND (b.available_to   IS NULL OR booking_requests.end_date   <= b.available_to)
  )
);

-- ==============================================================================
-- BOOKING STATE MACHINE (replaces the earlier version of the function)
--   pending  -> accepted | rejected   (owner)
--   pending  -> cancelled             (advertiser)
--   accepted -> cancelled             (advertiser or owner)
--   rejected / cancelled are final
-- Accepting is refused if it overlaps an already-accepted booking.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.enforce_booking_request_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.billboard_id <> OLD.billboard_id
     OR NEW.advertiser_id <> OLD.advertiser_id
     OR NEW.owner_id <> OLD.owner_id
     OR NEW.start_date <> OLD.start_date
     OR NEW.end_date <> OLD.end_date THEN
    RAISE EXCEPTION 'Booking request terms are immutable';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status IN ('rejected', 'cancelled') THEN
      RAISE EXCEPTION 'A % request cannot be changed', OLD.status;
    END IF;

    IF NEW.status = 'accepted' THEN
      IF auth.uid() <> OLD.owner_id OR OLD.status <> 'pending' THEN
        RAISE EXCEPTION 'Only the owner can accept a pending request';
      END IF;
      IF EXISTS (
        SELECT 1 FROM public.booking_requests o
        WHERE o.billboard_id = NEW.billboard_id
          AND o.id <> NEW.id
          AND o.status = 'accepted'
          AND o.start_date <= NEW.end_date
          AND o.end_date   >= NEW.start_date
      ) THEN
        RAISE EXCEPTION 'These dates overlap an already accepted booking';
      END IF;
    ELSIF NEW.status = 'rejected' THEN
      IF auth.uid() <> OLD.owner_id OR OLD.status <> 'pending' THEN
        RAISE EXCEPTION 'Only the owner can reject a pending request';
      END IF;
    ELSIF NEW.status = 'cancelled' THEN
      IF auth.uid() NOT IN (OLD.advertiser_id, OLD.owner_id) THEN
        RAISE EXCEPTION 'Not authorized';
      END IF;
    ELSE
      RAISE EXCEPTION 'Invalid status change';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ==============================================================================
-- PROFILES: block role changes from the client; owners-only billboard creation
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- auth.uid() is NULL for the SQL editor / service role, which may still fix roles
  IF auth.uid() IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Role cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;
CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

DROP POLICY IF EXISTS "insert_billboards" ON public.billboards;
CREATE POLICY "insert_billboards"
ON public.billboards FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'owner'
  )
);

-- ==============================================================================
-- PROFILE VISIBILITY
--   * public_owner_profiles: safe columns only, for owners who have a published listing
--   * owners may read the profile of advertisers who sent them a request
-- ==============================================================================
CREATE OR REPLACE VIEW public.public_owner_profiles AS
SELECT p.id, p.full_name, p.avatar_url
FROM public.profiles p
WHERE p.role = 'owner'
  AND EXISTS (
    SELECT 1 FROM public.billboards b
    WHERE b.owner_id = p.id AND b.status = 'published'
  );

GRANT SELECT ON public.public_owner_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "owners_select_requesting_advertisers" ON public.profiles;
CREATE POLICY "owners_select_requesting_advertisers"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.booking_requests r
    WHERE r.advertiser_id = profiles.id
      AND r.owner_id = auth.uid()
  )
);

-- ==============================================================================
-- BOOKED DATE RANGES: lets the booking form show unavailable dates without
-- exposing who booked or any request details
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_booked_ranges(p_billboard_id uuid)
RETURNS TABLE (start_date date, end_date date)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT r.start_date, r.end_date
  FROM public.booking_requests r
  JOIN public.billboards b ON b.id = r.billboard_id
  WHERE r.billboard_id = p_billboard_id
    AND r.status = 'accepted'
    AND b.status = 'published'
    AND r.end_date >= current_date
  ORDER BY r.start_date;
$$;

REVOKE ALL ON FUNCTION public.get_booked_ranges(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_booked_ranges(uuid) TO anon, authenticated;

-- ==============================================================================
-- STORAGE: restrict the bucket to images up to 5 MB
-- ==============================================================================
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'billboard-images';
