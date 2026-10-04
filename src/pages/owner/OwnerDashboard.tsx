import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, Inbox, Plus, ArrowRight, LayoutDashboard, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BillboardStatusBadge, BookingStatusBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { formatCurrency, formatDate, formatLocation } from '@/utils/format';
import type { Billboard, BookingRequest } from '@/types';

export function OwnerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const [{ data: billboardData }, { data: requestData }] = await Promise.all([
        supabase.from('billboards').select('*').eq('owner_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('booking_requests').select('*').eq('owner_id', user!.id).order('created_at', { ascending: false }),
      ]);
      setBillboards((billboardData ?? []) as Billboard[]);
      setRequests((requestData ?? []) as BookingRequest[]);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading) {
    return <LoadingState message="Loading your dashboard…" />;
  }

  const publishedCount = billboards.filter((b) => b.status === 'published').length;
  const draftCount = billboards.filter((b) => b.status === 'draft').length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const stats = [
    { label: 'Total Listings', value: billboards.length, icon: <ImageIcon size={20} /> },
    { label: 'Published', value: publishedCount, icon: <Eye size={20} /> },
    { label: 'Drafts', value: draftCount, icon: <LayoutDashboard size={20} /> },
    { label: 'Pending Requests', value: pendingCount, icon: <Inbox size={20} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Owner Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your billboards and booking requests</p>
        </div>
        <Link to="/owner/billboards/new">
          <Button>
            <Plus size={16} />
            Add Billboard
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                {stat.icon}
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-ink-900">{stat.value}</p>
            <p className="text-sm text-ink-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-ink-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link to="/owner/billboards/new">
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:border-brand-300 hover:bg-brand-50/50 transition-colors">
              <Plus size={20} className="text-brand-600" />
              <span className="font-medium text-ink-800">Add Billboard</span>
            </div>
          </Link>
          <Link to="/owner/billboards">
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:border-brand-300 hover:bg-brand-50/50 transition-colors">
              <ImageIcon size={20} className="text-brand-600" />
              <span className="font-medium text-ink-800">View My Billboards</span>
            </div>
          </Link>
          <Link to="/owner/requests">
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:border-brand-300 hover:bg-brand-50/50 transition-colors">
              <Inbox size={20} className="text-brand-600" />
              <span className="font-medium text-ink-800">View Requests</span>
            </div>
          </Link>
        </div>
      </Card>

      {/* My Billboards */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">My Billboards</h2>
          <Link to="/owner/billboards" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        {billboards.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<ImageIcon size={28} />}
            title="No billboards yet"
            message="Add your first billboard listing to start receiving booking requests."
            action={
              <Link to="/owner/billboards/new">
                <Button>Add Billboard</Button>
              </Link>
            }
          />
        ) : (
          <div className="mt-4 space-y-3">
            {billboards.slice(0, 5).map((b) => (
              <Card key={b.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-16 shrink-0 rounded-lg bg-ink-200" />
                  <div>
                    <p className="font-medium text-ink-900">{b.title}</p>
                    <p className="text-sm text-ink-500">{formatLocation(b.city, b.country)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden text-sm font-medium text-ink-900 sm:block">
                    {formatCurrency(b.price, b.currency)}
                  </span>
                  <BillboardStatusBadge status={b.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Recent Booking Requests</h2>
          <Link to="/owner/requests" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        {requests.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<Inbox size={28} />}
            title="No booking requests yet"
            message="When advertisers request to book your billboards, they'll appear here."
          />
        ) : (
          <div className="mt-4 space-y-3">
            {requests.slice(0, 5).map((r) => (
              <Card key={r.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink-900">
                    {formatDate(r.start_date)} — {formatDate(r.end_date)}
                  </p>
                  <p className="text-sm text-ink-500">
                    {r.message ? r.message.slice(0, 50) + (r.message.length > 50 ? '…' : '') : 'No message'}
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
