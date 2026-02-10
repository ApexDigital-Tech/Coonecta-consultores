-- ================================================
-- 🔧 CONECTA - FIX ACCESO ADMIN (Ejecutar en SQL Editor de Supabase)
-- ================================================
-- Este script arregla el error 500 causado por políticas RLS circulares.
-- Copia y pega TODO en el SQL Editor y haz clic en RUN.
-- ================================================

-- 1. Función RPC para obtener rol del usuario (evita RLS circular)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- 2. Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon;

-- 3. Verificación
SELECT public.get_my_role() as mi_rol;

-- ================================================
-- ✅ Si ves "admin" arriba, la función está lista.
-- Ahora refresca tu web (Ctrl+Shift+R).
-- ================================================
