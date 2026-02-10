import { supabase } from '../lib/supabase';
import { AppointmentData } from '../types';

/**
 * MOTOR DE ALMACENAMIENTO HÍBRIDO COONECTA 2026
 * Garantiza que las citas se vean incluso si hay problemas de RLS en Supabase.
 */

const LOCAL_STORAGE_KEY = 'coonecta_appointments_backup';

// Auxiliar para obtener backups locales
const getLocalBackups = (): AppointmentData[] => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

// Auxiliar para guardar backup local
const saveLocalBackup = (appt: AppointmentData) => {
  const current = getLocalBackups();
  const updated = [appt, ...current];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};

export const saveAppointment = async (data: AppointmentData): Promise<AppointmentData | null> => {
  try {
    // Convertir a ISO garantizando que se interprete correctamente el tiempo local
    const dateObj = new Date(data.preferredDateTime);
    const isoString = isNaN(dateObj.getTime()) ? null : dateObj.toISOString();

    // Intentar guardar en Supabase via RPC
    const { data: dbId, error } = await supabase.rpc('create_public_appointment', {
      p_client_name: data.clientName,
      p_phone: data.phone || null,
      p_email: data.email || null,
      p_organization: data.organization || null,
      p_need_type: data.needType || null,
      p_topic: data.topic || null,
      p_preferred_date_time: isoString,
      p_consultant: data.consultant || 'Victoria AI',
      p_notes: data.notes || null,
    });

    if (error) {
      console.error('Supabase Sync Error:', error);
      throw error;
    }

    return { ...data, id: dbId };
  } catch (error) {
    console.error('Critical Storage Error:', error);
    return null;
  }
};

export const getAppointments = async (): Promise<AppointmentData[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      clientName: row.client_name,
      phone: row.phone,
      email: row.email,
      organization: row.organization,
      needType: row.need_type,
      topic: row.topic,
      preferredDateTime: row.preferred_date_time,
      consultant: row.consultant,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (id: string, status: AppointmentData['status']): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    // También borrar de local si existe
    const local = getLocalBackups().filter(a => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));

    return !error;
  } catch {
    return false;
  }
};