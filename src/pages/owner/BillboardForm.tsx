import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { GalleryImage } from '@/components/ui/ImageUpload';
import { removeBillboardImageFile } from '@/lib/storage';
import {
  BILLBOARD_TYPES,
  BILLBOARD_LIGHTING,
  BILLBOARD_STATUSES,
  PRICING_PERIODS,
  CURRENCIES,
  COUNTRY_CURRENCY_MAP,
} from '@/lib/constants';
import type { BillboardType, BillboardLighting, BillboardStatus, PricingPeriod, CurrencyCode } from '@/types';
import { getCurrencyForCountry } from '@/utils/format';

export function BillboardForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '' as BillboardType | '',
    location: '',
    latitude: '',
    longitude: '',
    city: '',
    country: '',
    width: '',
    height: '',
    price: '',
    currency: 'USD' as CurrencyCode,
    pricing_period: 'month' as PricingPeriod,
    lighting: 'none' as BillboardLighting,
    status: 'draft' as BillboardStatus,
    available_from: '',
    available_to: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === 'country') {
      const currency = getCurrencyForCountry(value);
      setForm((prev) => ({ ...prev, country: value, currency }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);

    const payload = {
      owner_id: user.id,
      title: form.title,
      description: form.description || null,
      type: form.type || null,
      location: form.location || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      city: form.city || null,
      country: form.country || null,
      width: form.width ? Number(form.width) : null,
      height: form.height ? Number(form.height) : null,
      price: Number(form.price),
      currency: form.currency,
      pricing_period: form.pricing_period,
      lighting: form.lighting,
      status: form.status,
      available_from: form.available_from || null,
      available_to: form.available_to || null,
    };

    const { data: created, error: insertError } = await supabase
      .from('billboards')
      .insert(payload)
      .select('id')
      .single();

    if (insertError || !created) {
      setError(insertError?.message ?? 'Could not create the billboard.');
      setSaving(false);
      return;
    }

    if (images.length > 0) {
      const { error: imagesError } = await supabase.from('billboard_images').insert(
        images.map((img, i) => ({
          billboard_id: created.id,
          image_url: img.url,
          display_order: i,
        })),
      );
      if (imagesError) {
        // Listing exists already - send the owner to the edit page to re-add photos
        console.error('Saving images failed:', imagesError.message);
        navigate(`/owner/billboards/${created.id}/edit`);
        return;
      }
    }

    navigate('/owner/billboards');
  };

  const handleCancel = async () => {
    // Uploaded-but-unsaved photos would otherwise be orphaned in storage
    await Promise.all(images.map((img) => removeBillboardImageFile(img.url)));
    navigate('/owner/billboards');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button
          onClick={() => navigate('/owner/billboards')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft size={16} />
          Back to My Billboards
        </button>
        <h1 className="text-2xl font-bold text-ink-900">Add Billboard</h1>
        <p className="mt-1 text-sm text-ink-500">Create a new billboard listing</p>
      </div>

      {error && (
        <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3">
          <p className="text-sm text-error-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Basic Information</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Title"
              required
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Times Square Digital Display"
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the billboard, its visibility, traffic, and audience…"
              rows={4}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Billboard Type"
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="">Select type…</option>
                {BILLBOARD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
              <Select
                label="Lighting"
                value={form.lighting}
                onChange={(e) => handleChange('lighting', e.target.value)}
              >
                {BILLBOARD_LIGHTING.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Location</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Address / Location"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. 123 Main Street, Downtown"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="City"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g. New York"
              />
              <Select
                label="Country"
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
              >
                <option value="">Select country…</option>
                {Object.keys(COUNTRY_CURRENCY_MAP).map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                placeholder="40.7589"
                hint="For map placement"
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                placeholder="-73.9851"
                hint="For map placement"
              />
            </div>
          </div>
        </Card>

        {/* Dimensions & pricing */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Dimensions & Pricing</h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Width (meters)"
                type="number"
                step="0.01"
                value={form.width}
                onChange={(e) => handleChange('width', e.target.value)}
                placeholder="6.0"
              />
              <Input
                label="Height (meters)"
                type="number"
                step="0.01"
                value={form.height}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="3.0"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Price"
                type="number"
                required
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="2500"
              />
              <Select
                label="Currency"
                value={form.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </Select>
              <Select
                label="Pricing Period"
                value={form.pricing_period}
                onChange={(e) => handleChange('pricing_period', e.target.value)}
              >
                {PRICING_PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Photos</h2>
          <p className="mt-1 text-sm text-ink-500">The first photo is used as the cover image.</p>
          <div className="mt-4">
            {user && (
              <ImageUpload
                userId={user.id}
                images={images}
                disabled={saving}
                onAdd={(url) => setImages((prev) => [...prev, { key: url, url }])}
                onRemove={async (img) => {
                  setImages((prev) => prev.filter((p) => p.key !== img.key));
                  await removeBillboardImageFile(img.url);
                }}
              />
            )}
          </div>
        </Card>

        {/* Availability & status */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Availability & Status</h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                type="date"
                label="Available From"
                value={form.available_from}
                onChange={(e) => handleChange('available_from', e.target.value)}
              />
              <Input
                type="date"
                label="Available To"
                value={form.available_to}
                onChange={(e) => handleChange('available_to', e.target.value)}
              />
            </div>
            <Select
              label="Listing Status"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {BILLBOARD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            <Save size={16} />
            Save Billboard
          </Button>
        </div>
      </form>
    </div>
  );
}
