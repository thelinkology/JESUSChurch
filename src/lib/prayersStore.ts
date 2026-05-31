import { supabase, publicSupabase } from './supabase';

export type PrayerStatus = 'pending' | 'approved' | 'rejected' | 'answered';

export interface PrayerRequest {
  id: string;
  content: string;
  author_name: string;
  author_id?: string;
  is_public: boolean;
  status: PrayerStatus;
  prayer_count: number;
  created_at?: string;
}

export const getPrayers = async (publicOnly = true, approvedOnly = true): Promise<PrayerRequest[]> => {
  let query = publicSupabase.from('prayers').select('*').order('created_at', { ascending: false });
  if (publicOnly) query = query.eq('is_public', true);
  if (approvedOnly) query = query.in('status', ['approved', 'answered']);
  const { data, error } = await query;
  if (error) { console.error('getPrayers:', error.message); return []; }
  return data ?? [];
};

export const getAllPrayers = async (): Promise<PrayerRequest[]> => {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAllPrayers:', error.message); return []; }
  return data ?? [];
};

export const addPrayer = async (prayer: Omit<PrayerRequest, 'id' | 'status' | 'prayer_count' | 'created_at'>): Promise<PrayerRequest> => {
  const { data, error } = await supabase
    .from('prayers')
    .insert([{ ...prayer, status: 'pending', prayer_count: 0 }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updatePrayerStatus = async (id: string, status: PrayerStatus): Promise<void> => {
  const { error } = await supabase.from('prayers').update({ status }).eq('id', id);
  if (error) throw error;
};

export const deletePrayer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('prayers').delete().eq('id', id);
  if (error) throw error;
};

export const incrementPrayerCount = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('increment_prayer_count', { prayer_id: id });
  if (error) throw error;
};

// ─── Prayer Comments ──────────────────────────────────────────────────────────

export interface PrayerComment {
  id: string;
  prayer_id: string;
  author_id?: string;
  author_name: string;
  content: string;
  created_at?: string;
}

export const getPrayerComments = async (prayerId: string): Promise<PrayerComment[]> => {
  const { data, error } = await publicSupabase
    .from('prayer_comments')
    .select('*')
    .eq('prayer_id', prayerId)
    .order('created_at', { ascending: true });
  if (error) { console.error('getPrayerComments:', error.message); return []; }
  return data ?? [];
};

export const addPrayerComment = async (
  comment: Omit<PrayerComment, 'id' | 'created_at'>
): Promise<PrayerComment> => {
  const { data, error } = await supabase
    .from('prayer_comments')
    .insert([comment])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePrayerComment = async (id: string): Promise<void> => {
  const { error } = await supabase.from('prayer_comments').delete().eq('id', id);
  if (error) throw error;
};

/**
 * Fetch comment counts for a list of prayer IDs in one query.
 * Returns a map of prayer_id → count.
 */
export const getPrayerCommentCounts = async (prayerIds: string[]): Promise<Record<string, number>> => {
  if (!prayerIds.length) return {};
  const { data, error } = await publicSupabase
    .from('prayer_comments')
    .select('prayer_id')
    .in('prayer_id', prayerIds);
  if (error) { console.error('getPrayerCommentCounts:', error.message); return {}; }
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.prayer_id] = (counts[row.prayer_id] ?? 0) + 1;
  }
  return counts;
};

