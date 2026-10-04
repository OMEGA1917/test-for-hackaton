import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Check, X, Ban, ArrowRight, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { formatCurrency, formatDate } from '@/utils/format';
import type { BookingRequestWithDetails } from '@/types';

export function AdvertiserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<BookingRequestWithDetails[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetchRequests() {
      const { data } = await supabase
        .from('booking_requests')
        .select('*, billboard:billboards(id, title, city, country, price, currency)')
        .eq('advertiser_id', user!.id)
        .order('created_at', { ascending: false });
      setRequests((data ?? []) as BookingRequestWithDetails[]);
      setLoading(false);
    }
    fetchRequests();
  }, [user]);

  if (loading) return <LoadingState message="Loading your dashboard…" />;

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: <Inbox size={20} /> },
    { label: 'Pending', value: pendingCount, icon: <Search size={20} /> },
    { label: 'Accepted', value: acceptedCount, icon: <Check size={20} /> },
    { label: 'Rejected', value: rejectedCount, icon: <X size={20} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Advertiser Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Track your booking requests and campaigns</p>
        </div>
        <Link to="/billboards">
          <Button>
            <Search size={16} />
            Browse Billboards
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              {stat.icon}
            </div>
            <p className="mt-3 text-2xl font-bold text-ink-900">{stat.value}</p>
            <p className="text-sm text-ink-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-ink-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link to="/billboards">
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:border-brand-300 hover:bg-brand-50/50 transition-colors">
              <Search size={20} className="text-brand-600" />
              <span className="font-medium text-ink-800">Browse Billboards</span>
            </div>
          </Link>
          <Link to="/advertiser/bookings">
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:border-brand-300 hover:bg-brand-50/50 transition-colors">
              <Inbox size={20} className="text-brand-600" />
              <span className="font-medium text-ink-800">View My Bookings</span>
            </div>
          </Link>
        </div>
      </Card>

      {/* Recent requests */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Recent Booking Requests</h2>
          <Link to="/advertiser/bookings" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        {requests.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<Inbox size={28} />}
            title="No booking requests yet"
            message="Browse billboards and submit your first booking request to get started."
            action={
              <Link to="/billboards">
                <Button>Browse Billboards</Button>
              </Link>
            }
          />
        ) : (
          <div className="mt-4 space-y-3">
            {requests.slice(0, 5).map((r) => (
              <Card key={r.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink-900">{r.billboard?.title ?? 'Billboard'}</p>
                  <p className="text-sm text-ink-500">
                    {formatDate(r.start_date)} — {formatDate(r.end_date)}
                    {r.billboard && ` · ${formatCurrency(r.billboard.price, r.billboard.currency)}`}
                  </p>
                </div>
                <BookingStatusBadge status={r.status} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
