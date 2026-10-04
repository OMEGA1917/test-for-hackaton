import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Eye, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { formatCurrency, formatDate } from '@/utils/format';
import type { BookingRequestWithDetails } from '@/types';

export function AdvertiserBookings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<BookingRequestWithDetails[]>([]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('booking_requests')
      .select('*, billboard:billboards(id, title, city, country, price, currency)')
      .eq('advertiser_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setRequests((data ?? []) as BookingRequestWithDetails[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const cancelRequest = async (id: string) => {
    if (!confirm('Cancel this booking request?')) return;
    const { error } = await supabase
      .from('booking_requests')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r)),
      );
    }
  };

  if (loading) return <LoadingState message="Loading your bookings…" />;

  if (error) {
    return (
      <ErrorState
        title="Couldn't load bookings"
        message={error}
        action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My Bookings</h1>
        <p className="mt-1 text-sm text-ink-500">Track your booking request statuses</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title="No booking requests yet"
          message="Browse billboards and submit your first booking request to see it here."
          action={
            <Link to="/billboards">
              <Button>Browse Billboards</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-ink-900">
                      {r.billboard?.title ?? 'Billboard'}
                    </h3>
                    <BookingStatusBadge status={r.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-500">
                    <span>
                      <span className="text-ink-400">Dates:</span>{' '}
                      {formatDate(r.start_date)} — {formatDate(r.end_date)}
                    </span>
                    {r.billboard && (
                      <span>
                        <span className="text-ink-400">Price:</span>{' '}
                        {formatCurrency(r.billboard.price, r.billboard.currency)}
                      </span>
                    )}
                  </div>
                  {r.message && (
                    <p className="mt-3 rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-600">
                      {r.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {r.billboard && (
                    <Link to={`/billboards/${r.billboard.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye size={16} />
                        View
                      </Button>
                    </Link>
                  )}
                  {r.status === 'pending' && (
                    <Button size="sm" variant="ghost" onClick={() => cancelRequest(r.id)}>
                      <Ban size={16} />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
