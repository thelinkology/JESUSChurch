import { supabase, publicSupabase } from './supabase';
import { deleteImage } from './storageUtils';

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category?: string;
  image_url?: string;
  created_at?: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_email: string;
  user_name: string;
  created_at?: string;
}

export const getEvents = async (): Promise<ChurchEvent[]> => {
  const { data, error } = await publicSupabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) { console.error('getEvents:', error.message); return []; }
  return data ?? [];
};

export const addEvent = async (event: Omit<ChurchEvent, 'id' | 'created_at'>): Promise<ChurchEvent> => {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateEvent = async (id: string, updates: Partial<Omit<ChurchEvent, 'id' | 'created_at'>>): Promise<ChurchEvent> => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { data } = await supabase.from('events').select('image_url').eq('id', id).maybeSingle();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
  if (data?.image_url) await deleteImage(data.image_url).catch(() => {});
};

export const rsvpToEvent = async (eventId: string, name: string, email: string): Promise<void> => {
  const { error } = await supabase
    .from('event_registrations')
    .insert([{ event_id: eventId, name, email }]);
  // Ignore unique-constraint duplicates (user already registered)
  if (error && !error.message.includes('duplicate')) throw error;
};

export interface EventRegistration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  created_at?: string;
}

/** Admin: fetch all registrations for a single event */
export const getRegistrationsByEvent = async (eventId: string): Promise<EventRegistration[]> => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) { console.error('getRegistrationsByEvent:', error.message); return []; }
  return data ?? [];
};

/** User: get the list of event IDs the user has already RSVP'd to */
export const getUserRsvpedEventIds = async (email: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('email', email);
  if (error) { console.error('getUserRsvpedEventIds:', error.message); return []; }
  return (data ?? []).map((r: { event_id: string }) => r.event_id);
};
