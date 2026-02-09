-- ================================================
-- CONECTA - Crear Usuario Admin
-- ================================================
-- Ejecuta DESPUÉS de schema.sql
-- Primero crea el usuario en Authentication > Users

-- 1. Para hacer admin a un usuario existente:
-- Reemplaza 'tu-email@ejemplo.com' con el email del usuario
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'tu-email@ejemplo.com';

-- 2. Verificar que el rol se actualizó:
SELECT id, email, name, role FROM public.profiles;

-- 3. Si necesitas crear un admin directamente (después de que se registre):
-- El usuario debe primero registrarse en la app o ser invitado desde
-- Authentication > Users > Invite User

-- ================================================
-- Flujo recomendado:
-- 1. Ve a Authentication > Users
-- 2. Click "Invite User"
-- 3. Ingresa el email del admin
-- 4. El usuario recibe email y configura contraseña
-- 5. Ejecuta el UPDATE de arriba para darle rol admin
-- ================================================
