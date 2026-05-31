import { supabase } from './supabase';

export type GivingCategory = 'Tithes' | 'Offering' | 'Missions';
export type PaymentMethod = 'GCash' | 'BPI' | 'PayPal' | 'Cash/Check';
export type GivingStatus = 'pending' | 'completed' | 'failed';

export interface GivingTransaction {
  id: string;
  user_id?: string;
  donor_name: string;
  donor_email?: string;
  amount: number;
  category: GivingCategory;   // maps to DB column "fund"
  payment_method: PaymentMethod;
  status: GivingStatus;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

// Map DB row → TypeScript interface (fund → category)
function fromDB(row: Record<string, unknown>): GivingTransaction {
  return {
    id: row.id as string,
    user_id: row.user_id as string | undefined,
    donor_name: row.donor_name as string,
    donor_email: row.donor_email as string | undefined,
    amount: row.amount as number,
    category: row.fund as GivingCategory,
    payment_method: row.payment_method as PaymentMethod,
    status: row.status as GivingStatus,
    reference_number: row.reference_number as string | undefined,
    notes: row.notes as string | undefined,
    created_at: row.created_at as string,
  };
}

export const getGivingHistory = async (userId?: string): Promise<GivingTransaction[]> => {
  let query = supabase
    .from('giving')
    .select('*')
    .order('created_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) { console.error('getGivingHistory:', error.message); return []; }
  return (data ?? []).map(fromDB);
};

export const getAllGivingTransactions = async (): Promise<GivingTransaction[]> => {
  return getGivingHistory();
};

export const addGivingTransaction = async (
  transaction: Omit<GivingTransaction, 'id' | 'status' | 'created_at'>
): Promise<GivingTransaction> => {
  const dbRow = {
    user_id: transaction.user_id,
    donor_name: transaction.donor_name,
    donor_email: transaction.donor_email,
    amount: transaction.amount,
    fund: transaction.category,   // map category → fund
    payment_method: transaction.payment_method,
    reference_number: transaction.reference_number,
    notes: transaction.notes,
    status: transaction.reference_number ? 'completed' : 'pending',
  };
  const { data, error } = await supabase
    .from('giving')
    .insert([dbRow])
    .select()
    .single();
  if (error) throw error;
  return fromDB(data);
};

export const updateGivingStatus = async (id: string, status: GivingStatus): Promise<void> => {
  const { error } = await supabase.from('giving').update({ status }).eq('id', id);
  if (error) throw error;
};
