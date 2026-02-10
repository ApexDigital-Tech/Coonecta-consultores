# 🚀 Roadmap Crítico: Victoria AI + CONECTA 2026 (Lanzamiento MVP+)

Este documento establece los pasos finales e innegociables para el paso a producción. Sin parches, sin datos residuales.

---

## 📅 Fase 1: Limpieza Histórica y Estabilización (HOY)
**Objetivo:** Partir de una base de datos limpia y un código seguro.

- [ ] **Reset de Base de Datos (DB Zero):**
  - Truncar tabla `appointments` para eliminar leads de prueba.
  - Limpiar `profiles` si es necesario.
- [ ] **Cierre de Brechas de Seguridad:**
  - Eliminar el bypass de administrador en `hooks/useAuth.ts`.
  - Configurar políticas RLS definitivas en Supabase.
- [ ] **Garantía de Sincronización:**
  - Asegurar que el Dashboard cargue *todos* los registros de Supabase (sin depender del `localStorage` como fuente principal).
  - Corregir el bug donde registros sin fecha no se visualizan.

## 🤖 Fase 2: Perfeccionamiento de Victoria AI
**Objetivo:** Conversión máxima de leads.

- [ ] **Flujo de Cualificación:**
  - Revisar que Victoria capture siempre: Nombre, Organización, Celular y Tema.
- [ ] **Validación de Agenda:**
  - Impedir registros en el pasado o en horarios no laborales (si se desea).
- [ ] **Feedback de Usuario:**
  - Mejorar el mensaje de éxito post-agendamiento.

## 🎨 Fase 3: UX & Dashboard Master
**Objetivo:** Herramienta de gestión impecable para el Admin.

- [ ] **Vista de Leads por Contactar:**
  - Crear una sección en el Dashboard para registros que no tienen fecha asignada aún.
- [ ] **Notificaciones:**
  - (Opcional) Integración con Email (Resend) para avisar al equipo de un nuevo lead.
- [ ] **Refactor General:**
  - Dividir `AdminDashboard.tsx` en componentes más pequeños (CalendarView, ListView, DetailModal).

## 🚀 Fase 4: Despliegue y SEO
**Objetivo:** Visibilidad y estabilidad en Vercel.

- [ ] **SEO & Meta Tags:**
  - Configurar Title, Description y OpenGraph en `index.html`.
- [ ] **Vercel Sync:**
  - Verificación final de Variables de Entorno en el panel de Vercel.
- [ ] **Prueba de Humo (Smoke Test):**
  - Un registro real desde la web publicada.

---

**Estado Actual:** 🛠️ EN DESARROLLO (Fase 1)
