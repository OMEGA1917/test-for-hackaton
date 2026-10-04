import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BillboardStatusBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { formatCurrency, formatLocation } from '@/utils/format';
import type { Billboard } from '@/types';

export function OwnerBillboards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billboards, setBillboards] = useState<Billboard[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetchBillboards() {
      const { data, error } = await supabase
        .from('billboards')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setBillboards((data ?? []) as Billboard[]);
      }
      setLoading(false);
    }
    fetchBillboards();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this billboard? This cannot be undone.')) return;
    const { error } = await supabase.from('billboards').delete().eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      setBillboards(billboards.filter((b) => b.id !== id));
    }
  };

  if (loading) return <LoadingState message="Loading your billboards…" />;

  if (error) {
    return (
      <ErrorState
        title="Couldn't load billboards"
        message={error}
        action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">My Billboards</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your billboard listings</p>
        </div>
        <Link to="/owner/billboards/new">
          <Button>
            <Plus size={16} />
            Add Billboard
          </Button>
        </Link>
      </div>

      {billboards.length === 0 ? (
        <EmptyState
          icon={<Plus size={28} />}
          title="No billboards yet"
          message="Create your first billboard listing to start receiving booking requests from advertisers."
          action={
            <Link to="/owner/billboards/new">
              <Button>Add Billboard</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-ink-200 bg-ink-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Title</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500 sm:table-cell">Location</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500 sm:table-cell">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {billboards.map((b) => (
                <tr key={b.id} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{b.title}</p>
                    <p className="text-xs text-ink-400 sm:hidden">{formatLocation(b.city, b.country)}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-ink-600 sm:table-cell">
                    {formatLocation(b.city, b.country)}
                  </td>
                  <td className="hidden px-4 py-3 text-sm font-medium text-ink-900 sm:table-cell">
                    {formatCurrency(b.price, b.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <BillboardStatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/billboards/${b.id}`}>
                        <button className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-700" title="View">
                          <Eye size={16} />
                        </button>
                      </Link>
                      <Link to={`/owner/billboards/${b.id}/edit`}>
                        <button className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-700" title="Edit">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="rounded-lg p-2 text-ink-500 hover:bg-error-500/10 hover:text-error-500"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
