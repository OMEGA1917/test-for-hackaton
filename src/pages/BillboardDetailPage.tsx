import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Ruler,
  Sun,
  Calendar,
  DollarSign,
  ArrowLeft,
  User,
  Image as ImageIcon,
  Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { MapView } from '@/components/MapView';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { useAuth } from '@/hooks/useAuth';
import {
  formatCurrency,
  formatDimensions,
  formatLocation,
  formatDate,
} from '@/utils/format';
import {
  BILLBOARD_TYPES,
  BILLBOARD_LIGHTING,
  PRICING_PERIODS,
} from '@/lib/constants';
import type { BillboardWithImages, Profile } from '@/types';

type OwnerSummary = Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
type BookedRange = { start_date: string; end_date: string };

const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function BillboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billboard, setBillboard] = useState<BillboardWithImages | null>(null);
  const [owner, setOwner] = useState<OwnerSummary | null>(null);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
    message: '',
  });

  useEffect(() => {
    if (!id) return;
    async function fetchBillboard() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('billboards')
        .select('*, images:billboard_images(*)')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
      } else if (!data) {
        setError('Billboard not found');
      } else {
        const billboardData = data as BillboardWithImages;
        setBillboard(billboardData);

        if (billboardData.owner_id) {
          const { data: ownerData } = await supabase
            .from('public_owner_profiles')
            .select('id, full_name, avatar_url')
            .eq('id', billboardData.owner_id)
            .maybeSingle();
          setOwner(ownerData as OwnerSummary | null);
        }
      }
      setLoading(false);

      const { data: ranges } = await supabase.rpc('get_booked_ranges', { p_billboard_id: id });
      setBookedRanges((ranges ?? []) as BookedRange[]);
    }
    fetchBillboard();
  }, [id]);

  // Date strings are YYYY-MM-DD, so plain string comparison is correct
  const validateBookingDates = (start: string, end: string): string | null => {
    if (start < todayString()) return 'Start date cannot be in the past.';
    if (end < start) return 'End date must be on or after the start date.';
    if (billboard?.available_from && start < billboard.available_from) {
      return `This billboard is available from ${formatDate(billboard.available_from)}.`;
    }
    if (billboard?.available_to && end > billboard.available_to) {
      return `This billboard is available until ${formatDate(billboard.available_to)}.`;
    }
    const clash = bookedRanges.find((r) => r.start_date <= end && r.end_date >= start);
    if (clash) {
      return `Those dates overlap an existing booking (${formatDate(clash.start_date)} - ${formatDate(clash.end_date)}).`;
    }
    return null;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!billboard) return;
    if (!bookingForm.startDate || !bookingForm.endDate) {
      setBookingError('Please select start and end dates');
      return;
    }
    const validationError = validateBookingDates(bookingForm.startDate, bookingForm.endDate);
    if (validationError) {
      setBookingError(validationError);
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);

    const { error: insertError } = await supabase.from('booking_requests').insert({
      billboard_id: billboard.id,
      advertiser_id: user.id,
      owner_id: billboard.owner_id,
      start_date: bookingForm.startDate,
      end_date: bookingForm.endDate,
      message: bookingForm.message || null,
      status: 'pending',
    });

    if (insertError) {
      setBookingError(insertError.message);
    } else {
      setBookingSuccess(true);
    }
    setBookingSubmitting(false);
  };

  if (loading) {
    return (
      <div className="container-page py-20">
        <LoadingState message="Loading billboard details…" />
      </div>
    );
  }

  if (error || !billboard) {
    return (
      <div className="container-page py-20">
        <ErrorState
          title="Couldn't load this billboard"
          message={error ?? 'Billboard not found'}
          action={
            <Link to="/billboards">
              <Button>Back to Browse</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const images = billboard.images?.length
    ? [...billboard.images].sort((a, b) => a.display_order - b.display_order)
    : [];

  const typeLabel = billboard.type
    ? BILLBOARD_TYPES.find((t) => t.value === billboard.type)?.label
    : null;
  const lightingLabel = billboard.lighting
    ? BILLBOARD_LIGHTING.find((l) => l.value === billboard.lighting)?.label
    : null;
  const periodLabel = PRICING_PERIODS.find((p) => p.value === billboard.pricing_period)?.label;

  const minBookable =
    billboard.available_from && billboard.available_from > todayString()
      ? billboard.available_from
      : todayString();
  const isOwnListing = user?.id === billboard.owner_id;

  const hasMapCoords = billboard.latitude != null && billboard.longitude != null;

  return (
    <div className="container-page py-8">
      <Link
        to="/billboards"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft size={16} />
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Gallery + details */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="overflow-hidden rounded-xl bg-ink-200">
            <div className="aspect-[16/10] w-full">
              <img
                src={images[activeImage]?.image_url ?? 'https://images.pexels.com/photos/16559813/pexels-photo-16559813.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                alt={billboard.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === activeImage ? 'border-brand-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="mt-8">
            <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{billboard.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-ink-500">
              <MapPin size={18} />
              {billboard.location || formatLocation(billboard.city, billboard.country)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {typeLabel && <Badge variant="info">{typeLabel}</Badge>}
              {lightingLabel && <Badge variant="neutral">{lightingLabel}</Badge>}
              <Badge variant="success">Available</Badge>
            </div>

            {billboard.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-ink-900">Description</h2>
                <p className="mt-2 leading-relaxed text-ink-600">{billboard.description}</p>
              </div>
            )}

            {/* Specs */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-ink-900">Specifications</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Ruler size={20} className="text-brand-500" />
                    <div>
                      <p className="text-xs text-ink-400">Dimensions</p>
                      <p className="font-medium text-ink-900">
                        {formatDimensions(billboard.width, billboard.height)}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Sun size={20} className="text-brand-500" />
                    <div>
                      <p className="text-xs text-ink-400">Lighting</p>
                      <p className="font-medium text-ink-900">{lightingLabel ?? '—'}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign size={20} className="text-brand-500" />
                    <div>
                      <p className="text-xs text-ink-400">Pricing</p>
                      <p className="font-medium text-ink-900">
                        {formatCurrency(billboard.price, billboard.currency)} / {periodLabel}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-brand-500" />
                    <div>
                      <p className="text-xs text-ink-400">Availability</p>
                      <p className="font-medium text-ink-900">
                        {billboard.available_from || billboard.available_to
                          ? `${formatDate(billboard.available_from)} — ${formatDate(billboard.available_to)}`
                          : 'Year-round'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Map */}
            {hasMapCoords && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-ink-900">Location</h2>
                <Card className="mt-4 overflow-hidden">
                  <MapView
                    latitude={billboard.latitude!}
                    longitude={billboard.longitude!}
                    title={billboard.title}
                    className="h-80 w-full"
                  />
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card className="p-6">
              <p className="text-3xl font-bold text-ink-900">
                {formatCurrency(billboard.price, billboard.currency)}
              </p>
              <p className="text-sm text-ink-400">{periodLabel}</p>

              <div className="mt-6 space-y-3 border-t border-ink-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Type</span>
                  <span className="font-medium text-ink-900">{typeLabel ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Dimensions</span>
                  <span className="font-medium text-ink-900">
                    {formatDimensions(billboard.width, billboard.height)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">City</span>
                  <span className="font-medium text-ink-900">{billboard.city ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Country</span>
                  <span className="font-medium text-ink-900">{billboard.country ?? '—'}</span>
                </div>
              </div>

              <Button
                className="mt-6 w-full"
                size="lg"
                disabled={isOwnListing}
                onClick={() => {
                  if (!user) {
                    navigate('/signin');
                  } else {
                    setBookingModalOpen(true);
                  }
                }}
              >
                <Send size={18} />
                Request to Book
              </Button>
              {isOwnListing && (
                <p className="mt-2 text-center text-xs text-ink-400">This is your own listing</p>
              )}
              {!user && (
                <p className="mt-2 text-center text-xs text-ink-400">
                  Sign in to submit a booking request
                </p>
              )}
            </Card>

            {/* Owner info */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-ink-900">Listed By</h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                  {owner?.avatar_url ? (
                    <img src={owner.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-ink-900">
                    {owner?.full_name ?? 'Billboard Owner'}
                  </p>
                  <p className="text-xs text-ink-400">BoardSpot Member</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      <Modal
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setBookingSuccess(false);
          setBookingError(null);
        }}
        title={bookingSuccess ? 'Request Sent' : 'Request to Book'}
      >
        {bookingSuccess ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-500/10 text-success-500">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink-900">Booking request submitted</h3>
            <p className="mt-2 text-sm text-ink-500">
              The billboard owner will review your request and respond in your dashboard.
            </p>
            <Button
              className="mt-6"
              onClick={() => {
                setBookingModalOpen(false);
                setBookingSuccess(false);
                navigate('/advertiser/bookings');
              }}
            >
              View My Bookings
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="rounded-lg bg-ink-50 p-4">
              <p className="font-medium text-ink-900">{billboard.title}</p>
              <p className="text-sm text-ink-500">
                {formatCurrency(billboard.price, billboard.currency)} / {periodLabel}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="Start Date"
                min={minBookable}
                max={billboard.available_to ?? undefined}
                value={bookingForm.startDate}
                onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                required
              />
              <Input
                type="date"
                label="End Date"
                min={bookingForm.startDate || minBookable}
                max={billboard.available_to ?? undefined}
                value={bookingForm.endDate}
                onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                required
              />
            </div>

            {bookedRanges.length > 0 && (
              <div className="rounded-lg border border-warning-500/30 bg-warning-500/5 px-4 py-3 text-sm text-ink-600">
                <p className="font-medium text-ink-800">Already booked</p>
                <ul className="mt-1 space-y-0.5">
                  {bookedRanges.map((r) => (
                    <li key={`${r.start_date}-${r.end_date}`}>
                      {formatDate(r.start_date)} - {formatDate(r.end_date)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Textarea
              label="Message to Owner (optional)"
              placeholder="Describe your campaign, brand, or any questions…"
              value={bookingForm.message}
              onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
              rows={4}
            />

            {bookingError && (
              <p className="text-sm text-error-500">{bookingError}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={bookingSubmitting}>
                Send Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
