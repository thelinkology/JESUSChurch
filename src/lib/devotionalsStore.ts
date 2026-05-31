import { supabase, publicSupabase } from './supabase';

export interface Devotional {
  id: string;
  title: string;
  scripture_reference: string;
  content: string;
  devotional_date: string; // YYYY-MM-DD
  created_at?: string;
}

/** Returns today's devotional, or the most recent one if none is scheduled for today. */
export const getTodaysDevotional = async (): Promise<Devotional | null> => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await publicSupabase
    .from('devotionals')
    .select('*')
    .eq('devotional_date', today)
    .maybeSingle();
  if (error) { console.error('getTodaysDevotional:', error.message); return null; }
  if (data) return data as Devotional;

  // Fallback: most recently published devotional
  const { data: latest } = await publicSupabase
    .from('devotionals')
    .select('*')
    .order('devotional_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (latest ?? null) as Devotional | null;
};

export const getAllDevotionals = async (): Promise<Devotional[]> => {
  const { data, error } = await supabase
    .from('devotionals')
    .select('*')
    .order('devotional_date', { ascending: false });
  if (error) { console.error('getAllDevotionals:', error.message); return []; }
  return (data ?? []) as Devotional[];
};

export const addDevotional = async (
  devotional: Omit<Devotional, 'id' | 'created_at'>
): Promise<Devotional> => {
  const { data, error } = await supabase
    .from('devotionals')
    .insert([devotional])
    .select()
    .single();
  if (error) throw error;
  return data as Devotional;
};

export const updateDevotional = async (
  id: string,
  updates: Partial<Omit<Devotional, 'id' | 'created_at'>>
): Promise<Devotional> => {
  const { data, error } = await supabase
    .from('devotionals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Devotional;
};

export const deleteDevotional = async (id: string): Promise<void> => {
  const { error } = await supabase.from('devotionals').delete().eq('id', id);
  if (error) throw error;
};

// ── Completion tracking ──────────────────────────────────────────────────────

/** Returns the list of devotional IDs this user has completed. */
export const getUserDevotionalCompletions = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('devotional_completions')
    .select('devotional_id')
    .eq('user_id', userId);
  if (error) { console.error('getUserDevotionalCompletions:', error.message); return []; }
  return (data ?? []).map((row: { devotional_id: string }) => row.devotional_id);
};

/** Records that a user completed a devotional (idempotent). */
export const markDevotionalComplete = async (
  devotionalId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('devotional_completions')
    .upsert(
      [{ devotional_id: devotionalId, user_id: userId }],
      { onConflict: 'devotional_id,user_id', ignoreDuplicates: true }
    );
  if (error) throw error;
};

/** Returns how many members have completed a given devotional. */
export const getDevotionalCompletionCount = async (devotionalId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('devotional_completions')
    .select('id', { count: 'exact', head: true })
    .eq('devotional_id', devotionalId);
  if (error) return 0;
  return count ?? 0;
};
