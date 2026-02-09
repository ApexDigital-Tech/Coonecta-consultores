import { createClient } from '@supabase/supabase-js';

// Validación de variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://tu-proyecto-id.supabase.co') {
    console.error('⚠️ SUPABASE_URL no configurada. Configura .env.local');
}

if (!supabaseAnonKey || supabaseAnonKey === 'tu-anon-key-aqui') {
    console.error('⚠️ SUPABASE_ANON_KEY no configurada. Configura .env.local');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    }
);

// Tipos para la sesión
export type AuthUser = {
    id: string;
    email: string;
    role?: string;
    name?: string;
};
