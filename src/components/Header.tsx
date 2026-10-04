import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors',
      isActive ? 'text-brand-600' : 'text-ink-600 hover:text-ink-900',
    );

  const dashboardPath = profile?.role === 'owner' ? '/owner' : '/advertiser';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors duration-200',
        scrolled
          ? 'border-ink-200 bg-white/95 backdrop-blur-sm'
          : 'border-transparent bg-white',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/billboards" className={navLinkClass}>
            Browse Billboards
          </NavLink>
          {user && (
            <NavLink to={dashboardPath} className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-ink-500">
                {profile?.full_name ?? user.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate(dashboardPath)}>
                <LayoutDashboard size={16} />
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-ink-200 bg-white md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4">
            <Link
              to="/"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/billboards"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
              onClick={() => setMobileOpen(false)}
            >
              Browse Billboards
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-700 hover:bg-ink-100"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2 px-3">
                <Button variant="outline" size="md" onClick={() => { setMobileOpen(false); navigate('/signin'); }}>
                  Sign In
                </Button>
                <Button size="md" onClick={() => { setMobileOpen(false); navigate('/signup'); }}>
                  Get Started
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
