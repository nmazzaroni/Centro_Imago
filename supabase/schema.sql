-- Extensiones requeridas
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Perfiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('paciente','profesional','admin')),
  full_name text,
  phone_e164 text,
  specialty text,
  tags text[],
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Appointments
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null default encode(gen_random_bytes(4), 'hex'),
  slot_id uuid references public.time_slots(id),
  patient_id uuid references public.profiles(id) on delete set null,
  professional_id uuid references public.profiles(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null check (status in ('pending','confirmed','canceled')) default 'pending',
  created_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz default now()
);
alter table public.appointments enable row level security;

-- Slots
create table if not exists public.time_slots (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid references public.profiles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_available boolean not null default true,
  created_at timestamptz default now()
);
alter table public.time_slots enable row level security;

-- Tokens
create table if not exists public.action_tokens (
  id uuid primary key default uuid_generate_v4(),
  token text unique not null,
  type text not null check (type in ('appointment_confirm','appointment_cancel')),
  data jsonb not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);
alter table public.action_tokens enable row level security;

-- Mensajes internos
create table if not exists public.internal_messages (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  body text not null,
  created_at timestamptz default now()
);
alter table public.internal_messages enable row level security;

-- Novedades
create table if not exists public.news (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  published_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);
alter table public.news enable row level security;

-- RLS: Profiles
create policy if not exists "profiles_self" on public.profiles
for select using (
  auth.uid() = id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);
create policy if not exists "profiles_update_self" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

-- RLS: ver datos del otro si comparten turno
create policy if not exists "profiles_read_if_in_appointment" on public.profiles
for select using (
  auth.uid() = id
  or exists (
    select 1 from public.appointments a
    where (a.patient_id = auth.uid() and a.professional_id = profiles.id)
       or (a.professional_id = auth.uid() and a.patient_id = profiles.id)
  )
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);

-- RLS: Appointments
create policy if not exists "appointments_read" on public.appointments
for select using (
  auth.uid() = patient_id or auth.uid() = professional_id or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);
create policy if not exists "appointments_insert" on public.appointments
for insert with check (auth.uid() = created_by);
create policy if not exists "appointments_update" on public.appointments
for update using (
  auth.uid() = patient_id or auth.uid() = professional_id or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);

-- RLS: Slots
create policy if not exists "slots_read" on public.time_slots
for select using (professional_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy if not exists "slots_insert" on public.time_slots
for insert with check (professional_id = auth.uid());
create policy if not exists "slots_update" on public.time_slots
for update using (professional_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- RLS: Tokens (solo backend)
create policy if not exists "no_client_access_tokens" on public.action_tokens
for all using (false) with check (false);

-- RLS: Mensajes internos
create policy if not exists "messages_read" on public.internal_messages
for select using (exists (
  select 1 from public.appointments a
  where a.id = internal_messages.appointment_id
  and (a.patient_id = auth.uid() or a.professional_id = auth.uid()
       or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'))
));
create policy if not exists "messages_insert" on public.internal_messages
for insert with check (exists (
  select 1 from public.appointments a
  where a.id = appointment_id
  and (a.patient_id = auth.uid() or a.professional_id = auth.uid())
));

-- RLS: News
create policy if not exists "news_read_all" on public.news for select using (true);
create policy if not exists "news_insert_admin" on public.news for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- Vistas públicas
create or replace view public.professionals_public as
  select id, full_name, specialty
  from public.profiles
  where role = 'profesional';

create or replace view public.available_slots as
  select id, professional_id, start_at, end_at
  from public.time_slots
  where is_available = true and start_at > now();

grant select on public.professionals_public to anon, authenticated;
grant select on public.available_slots to anon, authenticated;

-- Índices
create index if not exists idx_appointments_professional on public.appointments(professional_id, start_at);
create index if not exists idx_appointments_patient on public.appointments(patient_id, start_at);
create index if not exists idx_timeslots_prof on public.time_slots(professional_id, start_at);
create index if not exists idx_slots_avail on public.time_slots(is_available, professional_id, start_at);

-- Reserva atómica
create or replace function public.book_slot(slot uuid, patient uuid, professional uuid, created_by uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  appt_id uuid;
  s public.time_slots%rowtype;
begin
  if patient <> auth.uid() then
    raise exception 'forbidden';
  end if;

  update public.time_slots
    set is_available = false
    where id = slot and is_available = true
    returning * into s;
  if not found then
    raise exception 'slot_unavailable';
  end if;

  insert into public.appointments(slot_id, patient_id, professional_id, start_at, end_at, status, created_by)
  values (slot, patient, s.professional_id, s.start_at, s.end_at, 'pending', auth.uid())
  returning id into appt_id;

  return appt_id;
end $$;

grant execute on function public.book_slot(uuid, uuid, uuid, uuid) to authenticated;
