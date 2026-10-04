import { cn } from '@/utils/cn';
import type { BookingStatus, BillboardStatus } from '@/types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-500/10 text-success-600 border-success-500/20',
  warning: 'bg-warning-500/10 text-warning-600 border-warning-500/20',
  error: 'bg-error-500/10 text-error-600 border-error-500/20',
  info: 'bg-brand-500/10 text-brand-700 border-brand-500/20',
  neutral: 'bg-ink-100 text-ink-600 border-ink-200',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

const bookingStatusMap: Record<BookingStatus, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  accepted: { variant: 'success', label: 'Accepted' },
  rejected: { variant: 'error', label: 'Rejected' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = bookingStatusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const billboardStatusMap: Record<BillboardStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'neutral', label: 'Draft' },
  published: { variant: 'success', label: 'Published' },
  unpublished: { variant: 'warning', label: 'Unpublished' },
};

export function BillboardStatusBadge({ status }: { status: BillboardStatus }) {
  const config = billboardStatusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
