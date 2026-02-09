import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Blindaje: Si no hay claves, no rompemos la web
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'TU_SUPABASE_URL_AQUI')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => !!supabase;