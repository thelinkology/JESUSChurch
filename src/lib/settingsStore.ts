import { supabase, publicSupabase } from './supabase';
import { deleteImage } from './storageUtils';

export interface ServiceTime {
  day: string;
  times: string[];
}

export interface ChurchSettings {
  church_name?: string;
  church_tagline?: string;
  church_address?: string;
  church_phone?: string;
  church_email?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  vision?: string;
  mission?: string;
  purpose?: string;
  cause?: string;
  service_times?: ServiceTime[];
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  founded_year?: string;
  about_story?: string;
  hero_image_url?: string;
  featured_sermon_id?: string;
  featured_group_ids?: string;
}

export interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image_url?: string;
  sort_order: number;
  created_at?: string;
}

export const getChurchSettings = async (): Promise<ChurchSettings> => {
  const { data, error } = await publicSupabase.from('church_settings').select('key, value');
  if (error) { console.error('getChurchSettings:', error.message); return {}; }

  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }
  return settings as ChurchSettings;
};

export const updateChurchSetting = async (key: string, value: unknown): Promise<void> => {
  const { error } = await supabase
    .from('church_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
};

export const updateChurchSettings = async (settings: Partial<ChurchSettings>): Promise<void> => {
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from('church_settings')
    .upsert(rows, { onConflict: 'key' });
  if (error) throw error;
};

export const getLeadership = async (): Promise<LeadershipMember[]> => {
  const { data, error } = await publicSupabase
    .from('leadership_team')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('getLeadership:', error.message); return []; }
  return data ?? [];
};

export const addLeader = async (leader: Omit<LeadershipMember, 'id' | 'created_at'>): Promise<LeadershipMember> => {
  const { data, error } = await supabase
    .from('leadership_team')
    .insert([leader])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateLeader = async (id: string, updates: Partial<Omit<LeadershipMember, 'id' | 'created_at'>>): Promise<LeadershipMember> => {
  const { data, error } = await supabase
    .from('leadership_team')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteLeader = async (id: string): Promise<void> => {
  const { data } = await supabase.from('leadership_team').select('image_url').eq('id', id).maybeSingle();
  const { error } = await supabase.from('leadership_team').delete().eq('id', id);
  if (error) throw error;
  if (data?.image_url) await deleteImage(data.image_url).catch(() => {});
};
