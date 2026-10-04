import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-ink-200 bg-white shadow-card',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}
