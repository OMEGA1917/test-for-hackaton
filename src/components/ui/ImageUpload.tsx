import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { uploadBillboardImage, validateImageFile } from '@/lib/storage';

export interface GalleryImage {
  key: string;
  url: string;
}

interface ImageUploadProps {
  userId: string;
  images: GalleryImage[];
  /** Called once per uploaded file with its public URL. */
  onAdd: (url: string) => Promise<void> | void;
  onRemove: (image: GalleryImage) => Promise<void> | void;
  max?: number;
  disabled?: boolean;
}

export function ImageUpload({
  userId,
  images,
  onAdd,
  onRemove,
  max = 8,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remaining = max - images.length;

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ''; // allow re-selecting the same file
    if (files.length === 0) return;

    setError(null);
    if (files.length > remaining) {
      setError(`You can add ${remaining} more image${remaining === 1 ? '' : 's'} (max ${max}).`);
      return;
    }

    const problems = files.map(validateImageFile).filter(Boolean);
    if (problems.length > 0) {
      setError(problems.join(' '));
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadBillboardImage(userId, file);
        await onAdd(url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (image: GalleryImage) => {
    setError(null);
    setRemovingKey(image.key);
    try {
      await onRemove(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove image.');
    } finally {
      setRemovingKey(null);
    }
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.key}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-200 bg-ink-100"
            >
              <img src={img.url} alt={`Billboard photo ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-ink-900/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(img)}
                disabled={disabled || removingKey === img.key}
                aria-label="Remove image"
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-ink-600 shadow-sm transition-colors hover:bg-white hover:text-error-600 disabled:opacity-50"
              >
                {removingKey === img.key ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFiles}
            disabled={disabled || uploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-300 px-4 py-6 text-sm font-medium text-ink-500 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            {uploading ? 'Uploading…' : 'Add photos (JPG, PNG or WebP, up to 5 MB each)'}
          </button>
        </>
      )}

      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
}
