import { supabase, publicSupabase } from './supabase';
import { deleteImage } from './storageUtils';

export interface ChurchLocation {
  id: string;
  name: string;
  address: string;
  phone?: string;
  pastor?: string;
  service_times?: string;
  image_url?: string;
  map_url?: string;
  sort_order: number;
  created_at?: string;
}

export const getLocations = async (): Promise<ChurchLocation[]> => {
  const { data, error } = await publicSupabase
    .from('church_locations')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('getLocations:', error.message); return []; }
  return data ?? [];
};

export const addLocation = async (
  location: Omit<ChurchLocation, 'id' | 'created_at'>
): Promise<ChurchLocation> => {
  const { data, error } = await supabase
    .from('church_locations')
    .insert([location])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateLocation = async (
  id: string,
  updates: Partial<Omit<ChurchLocation, 'id' | 'created_at'>>
): Promise<ChurchLocation> => {
  const { data, error } = await supabase
    .from('church_locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteLocation = async (id: string): Promise<void> => {
  const { data } = await supabase
    .from('church_locations')
    .select('image_url')
    .eq('id', id)
    .maybeSingle();
  const { error } = await supabase.from('church_locations').delete().eq('id', id);
  if (error) throw error;
  if (data?.image_url) await deleteImage(data.image_url).catch(() => {});
};
