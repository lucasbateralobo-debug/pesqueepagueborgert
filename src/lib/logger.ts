import { supabase } from './supabase';

export type ActionLog = {
  id?: string;
  user_id: string;
  user_name: string;
  action_type: 'produto_edit' | 'produto_delete' | 'estoque_edit' | 'consumo_add' | 'consumo_pago' | 'consumo_delete' | 'aniversario_edit';
  description: string;
  target_id: string;
  created_at?: string;
};

export const logAction = async (payload: ActionLog) => {
  try {
    const { error } = await supabase
      .from('action_logs')
      .insert([payload]);
    
    if (error) {
      console.warn('Logging error (maybe table not created?):', error.message);
    }
  } catch (err) {
    console.error('Action Log error:', err);
  }
};
