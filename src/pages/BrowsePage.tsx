import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BillboardCard } from '@/components/BillboardCard';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { GridSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import {
  BILLBOARD_TYPES,
  BILLBOARD_LIGHTING,
  SORT_OPTIONS,
  type SortOption,
} from '@/lib/constants';
import type { BillboardWithImages } from '@/types';
import { cn } from '@/utils/cn';

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [billboards, setBillboards] = useState<BillboardWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [billboardType, setBillboardType] = useState('');
  const [lighting, setLighting] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    async function fetchBillboards() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('billboards')
        .select('*, images:billboard_images(*)')
        .eq('status', 'published');

      // Commas, parentheses, quotes and LIKE wildcards would break the PostgREST or() filter
      const q = (searchParams.get('q') ?? '').replace(/[,()"'\\%_*]/g, ' ').trim();
      if (q) {
        query = query.or(`city.ilike.%${q}%,country.ilike.%${q}%,title.ilike.%${q}%,location.ilike.%${q}%`);
      }

      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setBillboards((data ?? []) as BillboardWithImages[]);
      }
      setLoading(false);
    }

    fetchBillboards();
  }, [searchParams, sortBy]);

  const filteredBillboards = useMemo(() => {
    return billboards.filter((b) => {
      if (billboardType && b.type !== billboardType) return false;
      if (lighting && b.lighting !== lighting) return false;
      if (minPrice && b.price < Number(minPrice)) return false;
      if (maxPrice && b.price > Number(maxPrice)) return false;
      return true;
    });
  }, [billboards, billboardType, lighting, minPrice, maxPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setBillboardType('');
    setLighting('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSearchParams({});
  };

  const hasActiveFilters = billboardType || lighting || minPrice || maxPrice || searchQuery;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink-900">Filters</h3>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by location…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Button type="submit" size="sm" className="mt-2 w-full">
          Search
        </Button>
      </form>

      <div className="border-t border-ink-200" />

      {/* Type */}
      <div>
        <label className="text-sm font-medium text-ink-700">Billboard Type</label>
        <div className="mt-2 space-y-2">
          {BILLBOARD_TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={type.value}
                checked={billboardType === type.value}
                onChange={(e) => setBillboardType(e.target.value)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-ink-600">{type.label}</span>
            </label>
          ))}
          {billboardType && (
            <button
              className="text-xs text-brand-600 hover:underline"
              onClick={() => setBillboardType('')}
            >
              Clear type
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-ink-200" />

      {/* Lighting */}
      <div>
        <label className="text-sm font-medium text-ink-700">Lighting</label>
        <div className="mt-2 space-y-2">
          {BILLBOARD_LIGHTING.map((light) => (
            <label key={light.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="lighting"
                value={light.value}
                checked={lighting === light.value}
                onChange={(e) => setLighting(e.target.value)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-ink-600">{light.label}</span>
            </label>
          ))}
          {lighting && (
            <button
              className="text-xs text-brand-600 hover:underline"
              onClick={() => setLighting('')}
            >
              Clear lighting
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-ink-200" />

      {/* Price range */}
      <div>
        <label className="text-sm font-medium text-ink-700">Price Range</label>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="text-sm"
          />
          <span className="text-ink-400">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          <X size={14} />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Browse Billboards</h1>
        <p className="mt-2 text-ink-500">
          Discover premium outdoor advertising spaces
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <Card className="sticky top-24 p-6">
            <FilterContent />
          </Card>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Mobile filter bar */}
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </Button>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-auto"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Desktop sort + count */}
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-sm text-ink-500">
              {loading
                ? 'Loading…'
                : `${filteredBillboards.length} billboard${filteredBillboards.length !== 1 ? 's' : ''} found`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-500">Sort by:</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-auto"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <GridSkeleton />
          ) : error ? (
            <ErrorState
              title="Couldn't load billboards"
              message={error}
              action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
            />
          ) : filteredBillboards.length === 0 ? (
            <EmptyState
              icon={<MapPin size={28} />}
              title="No billboards found"
              message="Try adjusting your filters or search terms to find more results."
              action={hasActiveFilters ? <Button variant="outline" onClick={clearFilters}>Clear Filters</Button> : undefined}
            />
          ) : (
            <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3')}>
              {filteredBillboards.map((billboard) => (
                <BillboardCard key={billboard.id} billboard={billboard} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-full overflow-y-auto bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
              >
                <X size={20} />
              </button>
            </div>
            <FilterContent />
            <Button
              className="mt-6 w-full"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Show Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
