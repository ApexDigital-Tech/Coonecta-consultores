-- ================================================
-- 🛠️ CONECTA 2026 - FIX SCHEMA & RESET (DB ZERO)
-- ================================================
-- Instrucciones: Copia y pega todo este script en el SQL EDITOR de Supabase.

-- 1. Limpieza Total (Reset a Cero)
TRUNCATE TABLE public.appointments;

-- 2. Asegurar Columnas Faltantes (Topic)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='topic') THEN
        ALTER TABLE public.appointments ADD COLUMN topic TEXT;
    END IF;
END $$;

-- 3. Actualizar Función RPC para el Chatbot (Victoria)
CREATE OR REPLACE FUNCTION public.create_public_appointment(
  p_client_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_organization TEXT DEFAULT NULL,
  p_need_type TEXT DEFAULT NULL,
  p_topic TEXT DEFAULT NULL,
  p_preferred_date_time TIMESTAMPTZ DEFAULT NULL,
  p_consultant TEXT DEFAULT 'Victoria AI',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.appointments (
    client_name, phone, email, organization, 
    need_type, topic, preferred_date_time, consultant, notes,
    status
  ) VALUES (
    p_client_name, p_phone, p_email, p_organization,
    p_need_type, p_topic, p_preferred_date_time, p_consultant, p_notes,
    'new'
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- 4. Asegurar que el usuario Admin tenga rol correcto
-- Reemplaza con tu correo si es diferente
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'apexdigital70@gmail.com';

-- 5. Robustecer RLS para el Dashboard
DROP POLICY IF EXISTS "Staff can view appointments" ON public.appointments;
CREATE POLICY "Staff can view appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'consultant')
    )
    OR (auth.jwt()->>'email' = 'apexdigital70@gmail.com') -- Rescate si falla el perfil
  );

-- ================================================
-- ✅ SCRIPT EJECUTADO. La base de datos está limpia y lista.
-- ================================================
