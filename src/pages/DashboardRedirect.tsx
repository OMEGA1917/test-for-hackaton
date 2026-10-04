import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/States';

/** Sends a signed-in user to the dashboard that matches their role. */
export function DashboardRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) {
    return <LoadingState message="Loading…" className="min-h-screen rounded-none border-0" />;
  }
  if (!user) return <Navigate to="/signin" replace />;

  return <Navigate to={profile?.role === 'owner' ? '/owner' : '/advertiser'} replace />;
}
