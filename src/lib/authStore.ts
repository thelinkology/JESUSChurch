import { supabase } from './supabase';

export type UserRole = 'Admin' | 'Leader' | 'Member' | 'Visitor';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  created_at?: string;
}

/** Fetch a profile by user ID — does NOT re-call getSession(), safe to use inside auth event callbacks. */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !profile) return null;
  return profile as UserProfile;
};

/** @deprecated Use getUserProfile(userId) inside auth event callbacks instead. */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return getUserProfile(session.user.id);
};

export const login = async (email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!profile) return { user: null, error: 'Profile not found. Please try again.' };

  return { user: profile as UserProfile, error: null };
};

export const register = async (
  email: string,
  fullName: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Registration failed. Please try again.' };

  // The trigger creates the profile; fetch it
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  // Profile may not exist if email confirmation is required
  const fallback: UserProfile = {
    id: data.user.id,
    email,
    full_name: fullName,
    role: 'Visitor',
  };

  return { user: (profile as UserProfile) ?? fallback, error: null };
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'phone'>>
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
};

export const getAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserProfile[];
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
  return !error;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  return !error;
};
