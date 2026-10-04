import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface StateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, message, icon, action, className }: StateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-300 bg-ink-50 px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ message, className }: { message?: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-ink-200 bg-white px-6 py-16 text-center',
        className,
      )}
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500"
        aria-hidden
      />
      <p className="mt-4 text-sm text-ink-500">{message ?? 'Loading…'}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  action,
  className,
}: StateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-error-500/20 bg-error-500/5 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-500/10 text-error-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
      <div className="aspect-[4/3] animate-pulse bg-ink-200" />
      <div className="p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-ink-200" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-ink-100" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-ink-100" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-ink-100" />
        </div>
        <div className="mt-4 h-8 w-full animate-pulse rounded-lg bg-ink-100" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
