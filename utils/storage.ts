import { supabase } from '../lib/supabase';
import { AppointmentData } from '../types';

/**
 * MOTOR DE ALMACENAMIENTO HÍBRIDO CONECTA 2026
 * Garantiza que las citas se vean incluso si hay problemas de RLS en Supabase.
 */

const LOCAL_STORAGE_KEY = 'conecta_appointments_backup';

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
  // 1. Crear el objeto con ID temporal para visibilidad inmediata
  const newAppt: AppointmentData = {
    ...data,
    id: crypto.randomUUID(),
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  // 2. Guardar en Backup Local (Garantiza que el usuario vea su propia cita)
  saveLocalBackup(newAppt);

  try {
    // 3. Intentar guardar en Supabase via RPC (Bypass de RLS para insert)
    const { data: dbId, error } = await supabase.rpc('create_public_appointment', {
      p_client_name: data.clientName,
      p_phone: data.phone || null,
      p_email: data.email || null,
      p_organization: data.organization || null,
      p_need_type: data.needType || null,
      p_topic: data.topic || null,
      p_preferred_date_time: data.preferredDateTime ? new Date(data.preferredDateTime).toISOString() : null,
      p_consultant: data.consultant || 'Victoria AI',
      p_notes: data.notes || null,
    });

    if (error) console.error('Supabase Sync Error:', error);
    if (dbId) newAppt.id = dbId; // Actualizar con ID real si conectó

    return newAppt;
  } catch (error) {
    console.error('Critical Storage Error:', error);
    return newAppt; // Seguimos retornando el local para que la UI no se rompa
  }
};

export const getAppointments = async (): Promise<AppointmentData[]> => {
  let remoteData: AppointmentData[] = [];

  try {
    // Intentar traer de la nube
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      remoteData = data.map(row => ({
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
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }

  // Unir con datos locales para asegurar que nada se pierda en la vista del admin
  const localData = getLocalBackups();
  const combined = [...remoteData];

  // Añadir locales que no estén en remotos (por ID)
  localData.forEach(local => {
    if (!combined.find(remote => remote.id === local.id)) {
      combined.push(local);
    }
  });

  return combined.sort((a, b) =>
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );
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