import { supabase, publicSupabase } from './supabase';
import { deleteImage } from './storageUtils';

export interface Ministry {
  id: string;
  title: string;
  description: string;
  age_group: string;
  image_url?: string;
  goals: string; // JSON string: string[]
  schedule?: string;
  location?: string;
  leader_name?: string;
  sort_order: number;
  created_at?: string;
}

export interface MinistryMember {
  id: string;
  ministry_id: string;
  user_id: string;
  joined_at?: string;
  full_name?: string;
}

export const getMinistries = async (): Promise<Ministry[]> => {
  const { data, error } = await publicSupabase
    .from('ministries')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('getMinistries:', error.message); return []; }
  return data ?? [];
};

export const getMinistryById = async (id: string): Promise<Ministry | null> => {
  const { data, error } = await publicSupabase
    .from('ministries')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.error('getMinistryById:', error.message); return null; }
  return data;
};

export const addMinistry = async (ministry: Omit<Ministry, 'id' | 'created_at'>): Promise<Ministry> => {
  const { data, error } = await supabase
    .from('ministries')
    .insert([ministry])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateMinistry = async (id: string, updates: Partial<Omit<Ministry, 'id' | 'created_at'>>): Promise<Ministry> => {
  const { data, error } = await supabase
    .from('ministries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteMinistry = async (id: string): Promise<void> => {
  const { data } = await supabase.from('ministries').select('image_url').eq('id', id).maybeSingle();
  const { error } = await supabase.from('ministries').delete().eq('id', id);
  if (error) throw error;
  if (data?.image_url) await deleteImage(data.image_url).catch(() => {});
};

export const getMinistryMembers = async (ministryId: string): Promise<MinistryMember[]> => {
  // Step 1: get all membership rows for this ministry
  const { data: rows, error } = await publicSupabase
    .from('ministry_members')
    .select('id, ministry_id, user_id, joined_at')
    .eq('ministry_id', ministryId)
    .order('joined_at', { ascending: true });
  if (error) { console.error('getMinistryMembers:', error.message); return []; }
  if (!rows || rows.length === 0) return [];

  // Step 2: fetch display names from profiles in one query
  const userIds = rows.map((r: { user_id: string }) => r.user_id);
  const { data: profiles } = await publicSupabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);
  const nameMap: Record<string, string> = {};
  (profiles ?? []).forEach((p: { id: string; full_name: string }) => { nameMap[p.id] = p.full_name; });

  return rows.map((row: { id: string; ministry_id: string; user_id: string; joined_at?: string }) => ({
    id: row.id,
    ministry_id: row.ministry_id,
    user_id: row.user_id,
    joined_at: row.joined_at,
    full_name: nameMap[row.user_id] ?? 'Member',
  }));
};

export const getMinistryMemberCount = async (ministryId: string): Promise<number> => {
  const { count, error } = await publicSupabase
    .from('ministry_members')
    .select('id', { count: 'exact', head: true })
    .eq('ministry_id', ministryId);
  if (error) { console.error('getMinistryMemberCount:', error.message); return 0; }
  return count ?? 0;
};

export const getUserMinistryIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await publicSupabase
    .from('ministry_members')
    .select('ministry_id')
    .eq('user_id', userId);
  if (error) { console.error('getUserMinistryIds:', error.message); return []; }
  return (data ?? []).map((r: { ministry_id: string }) => r.ministry_id);
};

export const joinMinistry = async (ministryId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('ministry_members')
    .insert([{ ministry_id: ministryId, user_id: userId }]);
  if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) throw error;
};

export const leaveMinistry = async (ministryId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('ministry_members')
    .delete()
    .eq('ministry_id', ministryId)
    .eq('user_id', userId);
  if (error) throw error;
};

/** Parse goals JSON string into a string array */
export const parseGoals = (goals: string | undefined): string[] => {
  if (!goals) return [];
  try { return JSON.parse(goals); } catch { return []; }
};

/** Serialize goals lines into JSON string */
export const serializeGoals = (lines: string): string => {
  const arr = lines.split('\n').map(l => l.trim()).filter(Boolean);
  return JSON.stringify(arr);
};
