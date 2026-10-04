import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/States';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading…" className="min-h-screen rounded-none border-0" />;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Signed in but profile row not loaded yet: wait instead of redirecting to the wrong dashboard
  if (role && !profile) {
    return <LoadingState message="Loading…" className="min-h-screen rounded-none border-0" />;
  }

  if (role && profile?.role !== role) {
    const correctPath = profile?.role === 'owner' ? '/owner' : '/advertiser';
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
}
