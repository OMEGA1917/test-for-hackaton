import { supabase } from '@/lib/supabase';

export const BILLBOARD_BUCKET = 'billboard-images';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // matches the bucket limit in the migration
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Returns an error message if the file can't be uploaded, otherwise null. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: only JPG, PNG or WebP images are allowed.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: image is larger than 5 MB.`;
  }
  return null;
}

/**
 * Uploads to `<userId>/<uuid>.<ext>`. The first folder must be the user's id
 * because the storage RLS policy checks it.
 */
export async function uploadBillboardImage(userId: string, file: File): Promise<string> {
  const ext = EXT_BY_TYPE[file.type] ?? 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BILLBOARD_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) throw error;

  return supabase.storage.from(BILLBOARD_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Extracts the object path from a public URL of this bucket. */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/${BILLBOARD_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
}

/** Best-effort delete of the file behind a public URL. Never throws. */
export async function removeBillboardImageFile(url: string): Promise<void> {
  const path = storagePathFromUrl(url);
  if (!path) return;
  const { error } = await supabase.storage.from(BILLBOARD_BUCKET).remove([path]);
  if (error) console.warn('Could not delete image file:', error.message);
}
