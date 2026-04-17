import { createClient } from '@supabase/supabase-js';

// These will be injected via environment variables
// Create a .env file with your Supabase credentials
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'estoque' | 'funcionarios';

export type AppUser = {
  id: string;
  email: string;
  role: UserRole;
  nome: string;
  created_at: string;
};
