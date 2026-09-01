-- Clients & Agenda schema for Alenka Rocha - Catálogo de Pilates
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query > Run).
-- Adds the "students" (clients) and "class_sessions" (agenda) tables used by
-- the Clientes and Agenda screens. No seed data: starts empty for real use.

create table if not exists public.students (
  id text primary key,
  name text not null,
  phone text not null,
  "planId" text not null,
  "planName" text not null,
  "remainingClasses" integer not null,
  "totalPlanClasses" integer not null,
  limitations text,
  "weeklySchedule" text,
  "startDate" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.class_sessions (
  id text primary key,
  "studentId" text not null references public.students(id) on delete cascade,
  "studentName" text not null,
  "studentPhone" text,
  "studentLimitations" text,
  date text not null,
  time text not null,
  "classNumber" integer not null,
  "totalClasses" integer not null,
  "descriptionLabel" text,
  status text not null,
  "completedAt" timestamptz,
  notes text
);

alter table public.students enable row level security;
alter table public.class_sessions enable row level security;

-- Same open-access model as the exercise catalog: no login yet, so any
-- visitor of the published site can read and write. Revisit if login-gated
-- editing is added later.
drop policy if exists "Public full access students" on public.students;
create policy "Public full access students" on public.students
  for all using (true) with check (true);

drop policy if exists "Public full access class_sessions" on public.class_sessions;
create policy "Public full access class_sessions" on public.class_sessions
  for all using (true) with check (true);
