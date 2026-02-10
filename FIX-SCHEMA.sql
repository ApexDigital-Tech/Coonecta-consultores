-- ================================================
-- 🛠️ CONECTA 2026 - FIX COMPLETO (Ejecutar en SQL Editor de Supabase)
-- ================================================
-- PASO 1: Ejecuta TODO este script en el SQL Editor de Supabase
-- PASO 2: Refresca la página de tu web y vuelve a intentar login
-- ================================================

-- =============================================
-- 1. CREAR/VERIFICAR tabla profiles
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Agregar columna email si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- =============================================
-- 2. TRIGGER: Auto-crear perfil cuando alguien se registra
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        'user',
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();
    RETURN NEW;
END;
$$;

-- Eliminar trigger viejo si existe y recrear
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 3. SINCRONIZAR usuarios existentes a profiles
-- =============================================
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 4. ASIGNAR ROL ADMIN a tu cuenta
-- =============================================
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'apexdigital70@gmail.com';

-- =============================================
-- 5. POLÍTICAS RLS para profiles
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 6. TABLA appointments (verificar existencia)
-- =============================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    organization TEXT,
    need_type TEXT,
    topic TEXT,
    preferred_date_time TIMESTAMPTZ,
    consultant TEXT DEFAULT 'Victoria AI',
    notes TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Agregar columna topic si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='topic') THEN
        ALTER TABLE public.appointments ADD COLUMN topic TEXT;
    END IF;
END $$;

-- =============================================
-- 7. FUNCIÓN RPC para el Chatbot (Victoria)
-- =============================================
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

-- =============================================
-- 8. POLÍTICAS RLS para appointments
-- =============================================
DROP POLICY IF EXISTS "Staff can view appointments" ON public.appointments;
CREATE POLICY "Staff can view appointments"
    ON public.appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'consultant')
        )
    );

DROP POLICY IF EXISTS "Staff can update appointments" ON public.appointments;
CREATE POLICY "Staff can update appointments"
    ON public.appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'consultant')
        )
    );

DROP POLICY IF EXISTS "Staff can delete appointments" ON public.appointments;
CREATE POLICY "Staff can delete appointments"
    ON public.appointments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;
CREATE POLICY "Anyone can insert appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

-- =============================================
-- ✅ VERIFICACIÓN FINAL
-- =============================================
SELECT 
    p.id,
    p.email, 
    p.role,
    CASE WHEN p.role = 'admin' THEN '✅ ADMIN ACTIVO' ELSE '❌ NO ES ADMIN' END as status
FROM public.profiles p
WHERE p.email = 'apexdigital70@gmail.com';

-- ================================================
-- ✅ LISTO. Si ves "✅ ADMIN ACTIVO" arriba, refresca tu web.
-- ================================================
