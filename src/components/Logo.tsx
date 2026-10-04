import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'light';
  showText?: boolean;
}

export function Logo({ className, variant = 'default', showText = true }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-ink-900';

  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)} aria-label="BoardSpot home">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <rect x="7" y="9" width="18" height="11" rx="2" fill="white" />
          <rect x="14.5" y="20" width="3" height="4" fill="white" />
          <rect x="11" y="24" width="10" height="2" rx="1" fill="white" />
        </svg>
      </div>
      {showText && (
        <span className={cn('text-lg font-bold tracking-tight', textColor)}>BoardSpot</span>
      )}
    </Link>
  );
}
