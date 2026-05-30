import { supabase, publicSupabase } from './supabase';
import { deleteImage } from './storageUtils';

export interface Sermon {
  id: string;
  title: string;
  description: string;
  youtubeLink: string;
  speaker: string;
  series: string;
  date: string;
  thumbnail_url?: string;
  created_at?: string;
}

// Map DB row (snake_case) → TypeScript interface
function fromDB(row: Record<string, unknown>): Sermon {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    youtubeLink: (row.youtube_link as string) ?? '',
    speaker: (row.speaker as string) ?? '',
    series: (row.series as string) ?? '',
    date: (row.date as string) ?? '',
    thumbnail_url: row.thumbnail_url as string | undefined,
    created_at: row.created_at as string | undefined,
  };
}

function toDB(sermon: Omit<Sermon, 'id' | 'created_at'>) {
  return {
    title: sermon.title,
    description: sermon.description,
    youtube_link: sermon.youtubeLink,
    speaker: sermon.speaker,
    series: sermon.series,
    date: sermon.date,
    thumbnail_url: sermon.thumbnail_url,
  };
}

export const getSermons = async (): Promise<Sermon[]> => {
  const { data, error } = await publicSupabase
    .from('sermons')
    .select('*')
    .order('date', { ascending: false });
  if (error) { console.error('getSermons:', error.message); return []; }
  return (data ?? []).map(fromDB);
};

export const getSermonById = async (id: string): Promise<Sermon | null> => {
  const { data, error } = await publicSupabase
    .from('sermons')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.error('getSermonById:', error.message); return null; }
  return data ? fromDB(data) : null;
};

export const getLatestSermon = async (): Promise<Sermon | null> => {
  const { data, error } = await publicSupabase
    .from('sermons')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) { console.error('getLatestSermon:', error.message); return null; }
  return data ? fromDB(data) : null;
};

export const addSermon = async (sermon: Omit<Sermon, 'id' | 'created_at'>): Promise<Sermon> => {
  const { data, error } = await supabase
    .from('sermons')
    .insert([toDB(sermon)])
    .select()
    .single();
  if (error) throw error;
  return fromDB(data);
};

export const updateSermon = async (id: string, updates: Partial<Omit<Sermon, 'id' | 'created_at'>>): Promise<Sermon> => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.youtubeLink !== undefined) dbUpdates.youtube_link = updates.youtubeLink;
  if (updates.speaker !== undefined) dbUpdates.speaker = updates.speaker;
  if (updates.series !== undefined) dbUpdates.series = updates.series;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.thumbnail_url !== undefined) dbUpdates.thumbnail_url = updates.thumbnail_url;

  const { data, error } = await supabase
    .from('sermons')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return fromDB(data);
};

export const deleteSermon = async (id: string): Promise<void> => {
  const { data } = await supabase.from('sermons').select('thumbnail_url').eq('id', id).maybeSingle();
  const { error } = await supabase.from('sermons').delete().eq('id', id);
  if (error) throw error;
  if (data?.thumbnail_url) await deleteImage(data.thumbnail_url).catch(() => {});
};
