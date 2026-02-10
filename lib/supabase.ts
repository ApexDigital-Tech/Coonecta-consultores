import { createClient } from '@supabase/supabase-js';

// Validación de variables de entorno con advertencias claras
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl &&
    supabaseUrl !== 'https://tu-proyecto-id.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'tu-anon-key-aqui';

if (!isConfigured) {
    console.warn('🔴 CONECTA: Supabase no está configurado correctamente en este entorno.');
}

export const supabase = createClient(
    supabaseUrl || 'https://missing-url.supabase.co',
    supabaseAnonKey || 'missing-key',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    }
);

// Función utilitaria para verificar configuración
export const isSupabaseConfigured = () => isConfigured;

// Tipos para la sesión
export type AuthUser = {
    id: string;
    email: string;
    role?: string;
    name?: string;
};
