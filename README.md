# Imago Web (MVP listo para Linktree)

Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS + PWA básico.
- Supabase: Auth + PostgreSQL + RLS + Realtime (opcional).
- WhatsApp: Twilio (sandbox o número verificado).
- Deploy: Vercel (frontend + APIs), Supabase cloud.

Funciones clave
- Roles: paciente, profesional, admin.
- Búsqueda de profesionales y horarios (sin exponer teléfono).
- Carga de disponibilidad por el profesional.
- Reserva atómica de turnos (evita doble booking).
- Confirmación por link via WhatsApp al profesional y aviso al paciente.
- Listado y cancelación de turnos (libera el slot).
- Novedades (lectura).

Setup
1) Variables (.env.local): completar NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL y TWILIO_* si usás WhatsApp.
2) Supabase: ejecutar supabase/schema.sql en SQL Editor.
3) Seed: npm i && npm run seed (crea 2 usuarios y 3 slots).
4) Dev: npm run dev → http://localhost:3000.

Producción
- Deploy en Vercel, mismas ENV vars, ajustar NEXT_PUBLIC_APP_URL al dominio público.

Notas
- Si no configurás Twilio aún, podés reemplazar lib/whatsapp.ts por un console.log para modo DEMO.
