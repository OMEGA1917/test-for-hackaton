import { useEffect, useState, useCallback } from 'react';
import { Check, X, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { formatCurrency, formatDate } from '@/utils/format';
import type { BookingRequestWithDetails } from '@/types';

export function OwnerRequests() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [requests, setRequests] = useState<BookingRequestWithDetails[]>([]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('booking_requests')
      .select('*, billboard:billboards(id, title, city, country, price, currency)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      const rows = (data ?? []) as BookingRequestWithDetails[];

      // Owners may read the profile of advertisers who sent them a request (RLS policy)
      const advertiserIds = [...new Set(rows.map((r) => r.advertiser_id))];
      const { data: profiles } = advertiserIds.length
        ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', advertiserIds)
        : { data: [] };
      type AdvertiserInfo = { id: string; full_name: string | null; avatar_url: string | null };
      const byId = new Map<string, AdvertiserInfo>(
        ((profiles ?? []) as AdvertiserInfo[]).map((p): [string, AdvertiserInfo] => [p.id, p]),
      );

      setRequests(
        rows.map((r) => ({ ...r, advertiser: byId.get(r.advertiser_id) ?? null })) as BookingRequestWithDetails[],
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('booking_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      setActionError(error.message);
    } else {
      setActionError(null);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    }
  };

  if (loading) return <LoadingState message="Loading booking requests…" />;

  if (error) {
    return (
      <ErrorState
        title="Couldn't load requests"
        message={error}
        action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Booking Requests</h1>
        <p className="mt-1 text-sm text-ink-500">Review and respond to advertiser booking requests</p>
      </div>

      {actionError && (
        <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3">
          <p className="text-sm text-error-600">{actionError}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title="No booking requests yet"
          message="When advertisers request to book your billboards, their requests will appear here for you to accept or reject."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-ink-900">{r.billboard?.title ?? 'Billboard'}</h3>
                    <BookingStatusBadge status={r.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-500">
                    <span>
                      <span className="text-ink-400">From:</span> {r.advertiser?.full_name ?? 'Advertiser'}
                    </span>
                    <span>
                      <span className="text-ink-400">Dates:</span> {formatDate(r.start_date)} — {formatDate(r.end_date)}
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

                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(r.id, 'accepted')}>
                      <Check size={16} />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'rejected')}>
                      <X size={16} />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
