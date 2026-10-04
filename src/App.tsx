import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { BrowsePage } from '@/pages/BrowsePage';
import { BillboardDetailPage } from '@/pages/BillboardDetailPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { DashboardRedirect } from '@/pages/DashboardRedirect';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OwnerDashboard } from '@/pages/owner/OwnerDashboard';
import { OwnerBillboards } from '@/pages/owner/OwnerBillboards';
import { BillboardForm } from '@/pages/owner/BillboardForm';
import { BillboardEdit } from '@/pages/owner/BillboardEdit';
import { OwnerRequests } from '@/pages/owner/OwnerRequests';
import { AdvertiserDashboard } from '@/pages/advertiser/AdvertiserDashboard';
import { AdvertiserBookings } from '@/pages/advertiser/AdvertiserBookings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/billboards" element={<BrowsePage />} />
            <Route path="/billboards/:id" element={<BillboardDetailPage />} />
          </Route>

          {/* Auth routes (no layout) */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Owner routes */}
          <Route
            element={
              <ProtectedRoute role="owner">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/billboards" element={<OwnerBillboards />} />
            <Route path="/owner/billboards/new" element={<BillboardForm />} />
            <Route path="/owner/billboards/:id/edit" element={<BillboardEdit />} />
            <Route path="/owner/requests" element={<OwnerRequests />} />
          </Route>

          {/* Advertiser routes */}
          <Route
            element={
              <ProtectedRoute role="advertiser">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/advertiser" element={<AdvertiserDashboard />} />
            <Route path="/advertiser/bookings" element={<AdvertiserBookings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
