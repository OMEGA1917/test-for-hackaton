import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Image,
  Inbox,
  Plus,
  Menu,
  X,
  LogOut,
  Home,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const ownerNav: NavItem[] = [
  { to: '/owner', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/owner/billboards', label: 'My Billboards', icon: <Image size={18} /> },
  { to: '/owner/billboards/new', label: 'Add Billboard', icon: <Plus size={18} /> },
  { to: '/owner/requests', label: 'Booking Requests', icon: <Inbox size={18} /> },
];

const advertiserNav: NavItem[] = [
  { to: '/advertiser', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/advertiser/bookings', label: 'My Bookings', icon: <Inbox size={18} /> },
  { to: '/billboards', label: 'Browse Billboards', icon: <Home size={18} /> },
];

export function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = profile?.role === 'owner' ? ownerNav : advertiserNav;
  const dashboardLabel = profile?.role === 'owner' ? 'Owner Dashboard' : 'Advertiser Dashboard';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
    );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-ink-200 bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-ink-200 px-6">
          <Logo />
        </div>
        <div className="px-4 py-3">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
            {dashboardLabel}
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-200 p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-ink-800">
              {profile?.full_name ?? 'Account'}
            </p>
            <p className="text-xs capitalize text-ink-400">{profile?.role}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between border-b border-ink-200 px-6">
              <Logo />
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-ink-200 p-4">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-100"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64">
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100"
          >
            <Menu size={22} />
          </button>
          <Logo showText={false} />
          <div className="w-10" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
