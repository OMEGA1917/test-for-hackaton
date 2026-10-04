import { Link } from 'react-router-dom';
import { MapPin, Ruler, Sun, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDimensions, formatLocation } from '@/utils/format';
import { BILLBOARD_TYPES, BILLBOARD_LIGHTING, PRICING_PERIODS } from '@/lib/constants';
import type { BillboardWithImages } from '@/types';

interface BillboardCardProps {
  billboard: BillboardWithImages;
}

export function BillboardCard({ billboard }: BillboardCardProps) {
  const imageUrl =
    billboard.images?.[0]?.image_url ??
    'https://images.pexels.com/photos/2623411/pexels-photo-2623411.jpeg?auto=compress&cs=tinysrgb&w=800';

  const typeLabel = billboard.type
    ? BILLBOARD_TYPES.find((t) => t.value === billboard.type)?.label
    : null;

  const lightingLabel = billboard.lighting
    ? BILLBOARD_LIGHTING.find((l) => l.value === billboard.lighting)?.label
    : null;

  const periodLabel = PRICING_PERIODS.find((p) => p.value === billboard.pricing_period)?.label;

  return (
    <Card hover className="flex flex-col overflow-hidden">
      <Link to={`/billboards/${billboard.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-200">
          <img
            src={imageUrl}
            alt={billboard.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          {typeLabel && (
            <div className="absolute left-3 top-3">
              <Badge variant="info">{typeLabel}</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/billboards/${billboard.id}`}>
          <h3 className="text-base font-semibold text-ink-900 line-clamp-1 hover:text-brand-600 transition-colors">
            {billboard.title}
          </h3>
        </Link>

        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
          <MapPin size={14} className="shrink-0" />
          {formatLocation(billboard.city, billboard.country)}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-500">
          {billboard.width != null && billboard.height != null && (
            <span className="flex items-center gap-1">
              <Ruler size={14} />
              {formatDimensions(billboard.width, billboard.height)}
            </span>
          )}
          {lightingLabel && lightingLabel !== 'No Lighting' && (
            <span className="flex items-center gap-1">
              <Sun size={14} />
              {lightingLabel}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-ink-900">
                {formatCurrency(billboard.price, billboard.currency)}
              </p>
              <p className="text-xs text-ink-400">{periodLabel}</p>
            </div>
            <Link to={`/billboards/${billboard.id}`}>
              <Button variant="outline" size="sm">
                View Details
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
