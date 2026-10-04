import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { GalleryImage } from '@/components/ui/ImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { removeBillboardImageFile } from '@/lib/storage';
import { LoadingState, ErrorState } from '@/components/ui/States';
import {
  BILLBOARD_TYPES,
  BILLBOARD_LIGHTING,
  BILLBOARD_STATUSES,
  PRICING_PERIODS,
  CURRENCIES,
  COUNTRY_CURRENCY_MAP,
} from '@/lib/constants';
import type { BillboardType, BillboardLighting, BillboardStatus, PricingPeriod, CurrencyCode, Billboard } from '@/types';
import { getCurrencyForCountry } from '@/utils/format';

export function BillboardEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: billboardId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const nextOrder = useRef(0);

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

  useEffect(() => {
    async function fetchBillboard() {
      const { data, error } = await supabase
        .from('billboards')
        .select('*')
        .eq('id', billboardId)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (data) {
        const b = data as Billboard;
        setForm({
          title: b.title,
          description: b.description ?? '',
          type: b.type ?? '',
          location: b.location ?? '',
          latitude: b.latitude?.toString() ?? '',
          longitude: b.longitude?.toString() ?? '',
          city: b.city ?? '',
          country: b.country ?? '',
          width: b.width?.toString() ?? '',
          height: b.height?.toString() ?? '',
          price: b.price.toString(),
          currency: b.currency,
          pricing_period: b.pricing_period,
          lighting: b.lighting,
          status: b.status,
          available_from: b.available_from ?? '',
          available_to: b.available_to ?? '',
        });

        const { data: imageRows } = await supabase
          .from('billboard_images')
          .select('id, image_url')
          .eq('billboard_id', b.id)
          .order('display_order', { ascending: true });
        const rows = (imageRows ?? []) as { id: string; image_url: string }[];
        nextOrder.current = rows.length;
        setImages(rows.map((r) => ({ key: r.id, url: r.image_url })));
      } else {
        setError('Billboard not found');
      }
      setLoading(false);
    }
    fetchBillboard();
  }, [billboardId]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'country') {
        next.currency = getCurrencyForCountry(value);
      }
      return next;
    });
  };

  const addImage = async (url: string) => {
    const { data, error: insertError } = await supabase
      .from('billboard_images')
      .insert({ billboard_id: billboardId, image_url: url, display_order: nextOrder.current++ })
      .select('id')
      .single();
    if (insertError || !data) {
      await removeBillboardImageFile(url);
      throw new Error(insertError?.message ?? 'Could not save the image.');
    }
    setImages((prev) => [...prev, { key: data.id as string, url }]);
  };

  const removeImage = async (img: GalleryImage) => {
    const { error: deleteError } = await supabase.from('billboard_images').delete().eq('id', img.key);
    if (deleteError) throw new Error(deleteError.message);
    setImages((prev) => prev.filter((p) => p.key !== img.key));
    await removeBillboardImageFile(img.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
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

    const { error: updateError } = await supabase
      .from('billboards')
      .update(payload)
      .eq('id', billboardId);

    if (updateError) {
      setError(updateError.message);
    } else {
      navigate('/owner/billboards');
    }
    setSaving(false);
  };

  if (loading) return <LoadingState message="Loading billboard…" />;

  if (error) {
    return (
      <ErrorState
        title="Couldn't load billboard"
        message={error}
        action={<Button onClick={() => navigate('/owner/billboards')}>Back to Billboards</Button>}
      />
    );
  }

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
        <h1 className="text-2xl font-bold text-ink-900">Edit Billboard</h1>
        <p className="mt-1 text-sm text-ink-500">Update your billboard listing</p>
      </div>

      {error && (
        <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3">
          <p className="text-sm text-error-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Basic Information</h2>
          <div className="mt-4 space-y-4">
            <Input label="Title" required value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
            <Textarea label="Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Billboard Type" value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
                <option value="">Select type…</option>
                {BILLBOARD_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </Select>
              <Select label="Lighting" value={form.lighting} onChange={(e) => handleChange('lighting', e.target.value)}>
                {BILLBOARD_LIGHTING.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Location</h2>
          <div className="mt-4 space-y-4">
            <Input label="Address / Location" value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="City" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
              <Select label="Country" value={form.country} onChange={(e) => handleChange('country', e.target.value)}>
                <option value="">Select country…</option>
                {Object.keys(COUNTRY_CURRENCY_MAP).map((country) => (<option key={country} value={country}>{country}</option>))}
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Latitude" type="number" step="any" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} />
              <Input label="Longitude" type="number" step="any" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Dimensions & Pricing</h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Width (meters)" type="number" step="0.01" value={form.width} onChange={(e) => handleChange('width', e.target.value)} />
              <Input label="Height (meters)" type="number" step="0.01" value={form.height} onChange={(e) => handleChange('height', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Price" type="number" required step="0.01" value={form.price} onChange={(e) => handleChange('price', e.target.value)} />
              <Select label="Currency" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                {CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>))}
              </Select>
              <Select label="Pricing Period" value={form.pricing_period} onChange={(e) => handleChange('pricing_period', e.target.value)}>
                {PRICING_PERIODS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Photos</h2>
          <p className="mt-1 text-sm text-ink-500">Changes to photos are saved immediately. The first photo is the cover.</p>
          <div className="mt-4">
            {user && (
              <ImageUpload userId={user.id} images={images} disabled={saving} onAdd={addImage} onRemove={removeImage} />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Availability & Status</h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input type="date" label="Available From" value={form.available_from} onChange={(e) => handleChange('available_from', e.target.value)} />
              <Input type="date" label="Available To" value={form.available_to} onChange={(e) => handleChange('available_to', e.target.value)} />
            </div>
            <Select label="Listing Status" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
              {BILLBOARD_STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </Select>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/owner/billboards')}>Cancel</Button>
          <Button type="submit" loading={saving}>
            <Save size={16} />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
