import { supabase } from './supabase';

const BUCKET = 'church-media';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/**
 * Upload a file to the church-media Supabase Storage bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Delete an image from Supabase Storage.
 * Safely ignores external URLs (Unsplash, etc.) — only deletes our own storage URLs.
 */
export async function deleteImage(url: string | undefined | null): Promise<void> {
  if (!url) return;
  if (!url.includes(SUPABASE_URL)) return; // external URL — skip
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = decodeURIComponent(url.substring(idx + marker.length));
  await supabase.storage.from(BUCKET).remove([path]);
}
