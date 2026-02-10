-- ==================================================
-- 🛠️ CONECTA 2026 - REPARACIÓN FINAL DE PERMISOS
-- ==================================================
-- Ejecuta este script en el SQL Editor de Supabase (https://supabase.com/dashboard/project/ilgbvqcxvfdcvkvfkitw/sql/new)
-- ==================================================

-- 1. Crear funciones SECURITY DEFINER para evitar recursividad en RLS
-- Estas funciones permiten consultar perfiles saltándose el bloqueo de RLS circular

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Asegurar que profiles tiene RLS y políticas correctas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- 3. Reparar políticas de appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view appointments" ON public.appointments;
CREATE POLICY "Staff can view appointments"
    ON public.appointments FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Everyone can insert" ON public.appointments; -- Limpieza de nombres anteriores
DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;
CREATE POLICY "Anyone can insert appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

-- 4. Asegurar que el usuario es ADMIN en la tabla profiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'apexdigital70@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 5. VERIFICACIÓN: Si esto devuelve 1 fila con 'admin', el sistema funcionará.
SELECT id, email, role FROM public.profiles WHERE email = 'apexdigital70@gmail.com';
