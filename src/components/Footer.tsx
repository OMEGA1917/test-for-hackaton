import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-ink-500">
              BoardSpot is a premium outdoor advertising marketplace connecting billboard owners with businesses. Find the right billboard and reach the right audience.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink-900">Explore</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/billboards" className="text-sm text-ink-500 hover:text-ink-800">
                  Browse Billboards
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-ink-500 hover:text-ink-800">
                  List Your Billboard
                </Link>
              </li>
              <li>
                <Link to="/signin" className="text-sm text-ink-500 hover:text-ink-800">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink-900">For Business</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/signup" className="text-sm text-ink-500 hover:text-ink-800">
                  Advertiser Sign Up
                </Link>
              </li>
              <li>
                <Link to="/advertiser" className="text-sm text-ink-500 hover:text-ink-800">
                  Advertiser Dashboard
                </Link>
              </li>
              <li>
                <Link to="/owner" className="text-sm text-ink-500 hover:text-ink-800">
                  Owner Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ink-200 pt-6">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} BoardSpot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
