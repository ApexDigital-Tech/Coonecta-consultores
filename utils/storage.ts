import { supabase } from '../lib/supabase';
import { AppointmentData } from '../types';

/**
 * Guardar una cita usando la función RPC pública
 * Esta función bypassa RLS para permitir citas desde el chatbot público
 */
export const saveAppointment = async (data: AppointmentData): Promise<AppointmentData | null> => {
  try {
    // Usar la función RPC que tiene SECURITY DEFINER
    const { data: appointmentId, error } = await supabase.rpc('create_public_appointment', {
      p_client_name: data.clientName,
      p_phone: data.phone || null,
      p_email: data.email || null,
      p_organization: data.organization || null,
      p_need_type: data.needType || null,
      p_preferred_date_time: data.preferredDateTime ? new Date(data.preferredDateTime).toISOString() : null,
      p_consultant: data.consultant || 'Bernarda Sarué',
      p_notes: data.notes || null,
    });

    if (error) {
      console.error('Error saving appointment:', error);
      return null;
    }

    // Retornar datos con el ID generado
    return {
      id: appointmentId,
      ...data,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error saving appointment:', error);
    return null;
  }
};

/**
 * Obtener todas las citas (requiere autenticación de admin/consultant)
 */
export const getAppointments = async (): Promise<AppointmentData[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }

    // Mapear snake_case a camelCase para compatibilidad
    return (data || []).map(row => ({
      id: row.id,
      clientName: row.client_name,
      phone: row.phone,
      email: row.email,
      organization: row.organization,
      needType: row.need_type,
      preferredDateTime: row.preferred_date_time,
      consultant: row.consultant,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

/**
 * Actualizar estado de una cita
 */
export const updateAppointmentStatus = async (id: string, status: AppointmentData['status']): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating status:', error);
    return false;
  }
};

/**
 * Eliminar una cita
 */
export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return false;
  }
};