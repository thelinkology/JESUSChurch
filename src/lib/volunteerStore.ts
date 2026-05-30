import { supabase, publicSupabase } from './supabase';

export interface VolunteerRole {
  id: string;
  title: string;
  department: string;
  description: string;
  schedule: string;
  is_active: boolean;
  created_at?: string;
}

export interface VolunteerApplication {
  id: string;
  role_id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'declined';
  created_at?: string;
}

export const getVolunteerRoles = async (): Promise<VolunteerRole[]> => {
  const { data, error } = await publicSupabase
    .from('volunteer_roles')
    .select('*')
    .eq('is_active', true)
    .order('department', { ascending: true });
  if (error) { console.error('getVolunteerRoles:', error.message); return []; }
  return data ?? [];
};

export const getAllVolunteerRoles = async (): Promise<VolunteerRole[]> => {
  const { data, error } = await supabase
    .from('volunteer_roles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const addVolunteerRole = async (role: Omit<VolunteerRole, 'id' | 'created_at'>): Promise<VolunteerRole> => {
  const { data, error } = await supabase
    .from('volunteer_roles')
    .insert([role])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateVolunteerRole = async (id: string, updates: Partial<Omit<VolunteerRole, 'id' | 'created_at'>>): Promise<VolunteerRole> => {
  const { data, error } = await supabase
    .from('volunteer_roles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteVolunteerRole = async (id: string): Promise<void> => {
  const { error } = await supabase.from('volunteer_roles').delete().eq('id', id);
  if (error) throw error;
};

export const getVolunteerApplications = async (): Promise<VolunteerApplication[]> => {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .select('*, volunteer_roles(title, department)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const applyToVolunteer = async (
  application: Omit<VolunteerApplication, 'id' | 'status' | 'created_at'>
): Promise<VolunteerApplication> => {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .insert([{ ...application, status: 'pending' }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateApplicationStatus = async (
  id: string,
  status: 'approved' | 'declined'
): Promise<void> => {
  const { error } = await supabase
    .from('volunteer_applications')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
};

export const getUserApplicationRoleIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .select('role_id')
    .eq('user_id', userId);
  if (error) { console.error('getUserApplicationRoleIds:', error.message); return []; }
  return (data ?? []).map(row => row.role_id);
};
