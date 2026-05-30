import { supabase, publicSupabase } from './supabase';

export interface SmallGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  leader: string;
  leader_id?: string;
  schedule: string;
  location: string;
  max_members?: number;
  is_active: boolean;
  is_featured?: boolean;
  created_at?: string;
}

export const getGroups = async (): Promise<SmallGroup[]> => {
  const { data, error } = await publicSupabase
    .from('groups')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) { console.error('getGroups:', error.message); return []; }
  return data ?? [];
};

export const getAllGroups = async (): Promise<SmallGroup[]> => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAllGroups:', error.message); return []; }
  return data ?? [];
};

export const addGroup = async (group: Omit<SmallGroup, 'id' | 'created_at'>): Promise<SmallGroup> => {
  const { data, error } = await supabase
    .from('groups')
    .insert([group])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGroup = async (id: string, updates: Partial<Omit<SmallGroup, 'id' | 'created_at'>>): Promise<SmallGroup> => {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteGroup = async (id: string): Promise<void> => {
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) throw error;
};

export const joinGroup = async (groupId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .insert([{ group_id: groupId, user_id: userId }]);
  if (error && !error.message.includes('duplicate')) throw error;
};

export const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
};

export const getUserJoinedGroupIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);
  if (error) { console.error('getUserJoinedGroupIds:', error.message); return []; }
  return (data ?? []).map(row => row.group_id);
};

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at?: string;
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
}

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  const { data, error } = await supabase
    .from('group_members')
    .select('*, profiles(full_name, email, phone, avatar_url)')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });
  if (error) { console.error('getGroupMembers:', error.message); return []; }
  return data ?? [];
};

export const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
};
