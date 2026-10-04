# Changes in this patch

## Fixed (build / runtime)
- `src/utils/format.ts`: restored `formatCurrency`, `formatDate`, `formatLocation`, `formatDimensions`,
  `getCurrencySymbol`, `getCurrencyForCountry`; kept `isDateDisabled` / `makeIsDateDisabled`.
- `src/components/ProtectedRoute.tsx`: restored the `role` + `children` version that `App.tsx` uses,
  redirects to `/signin`, and waits for the profile before checking the role.

## Database (apply in order)
- `20261004064641_create_profiles_billboards_bookings.sql` (unchanged)
- `20261004120000_harden_security_and_booking_rules.sql` (new, was the stray `deepseek_sql_*.sql`):
  - `handle_new_user` trigger creates the profile on sign-up
  - booking insert must be `pending`, inside the billboard's availability window, owner_id not spoofable
  - booking state machine: pending -> accepted/rejected/cancelled, accepted -> cancelled, rest final;
    accepting is refused if it overlaps an accepted booking
  - `role` cannot be changed from the client; only owners can create billboards
  - `public_owner_profiles` view (id, name, avatar only) and a policy letting owners read profiles of
    advertisers who requested them
  - `get_booked_ranges(billboard_id)` RPC for the booking form
  - storage: per-user folder policies, 5 MB / JPG-PNG-WebP limit

## App
- Sign-up no longer inserts the profile client-side; shows a "check your email" screen when confirmation is on.
- Sign-in / sign-up go to `/dashboard`, which redirects by role.
- Auth loading flag now waits for the profile fetch.
- Image upload: multi-photo uploader wired into Add and Edit billboard; saves `billboard_images` rows,
  uploads to `<user_id>/<uuid>.<ext>`, deletes files on removal.
- Booking form: past dates, end < start, outside availability and overlap with accepted bookings are
  rejected in the UI; date inputs get min/max; booked ranges are listed; owners cannot book their own listing.
- Detail page uses the safe owner view; owner requests show the advertiser's name.
- Browse search input is sanitised before use in the `or()` filter.
- 404 page instead of rendering the landing page for unknown URLs.
- Leaflet marker icons are bundled instead of loaded from unpkg.

## Repo hygiene
- Root `.gitignore`, `.env.example`, `public/_redirects`; removed nested `bolt/` copy, duplicate `.env`,
  old `boardspot-source.zip`, and committed `dist/`. Renamed package to `boardspot`; removed bolt.new og:image.

## Not verified here
No `node_modules`/network in the sandbox, so `tsc`, `eslint` and `vite build` were not run.
Run `npm install && npm run typecheck && npm run build` before deploying.
