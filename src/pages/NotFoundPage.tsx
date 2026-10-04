import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">404</p>
      <h1 className="mt-3 text-3xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-md text-ink-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/">
          <Button>Go home</Button>
        </Link>
        <Link to="/billboards">
          <Button variant="outline">Browse billboards</Button>
        </Link>
      </div>
    </div>
  );
}
