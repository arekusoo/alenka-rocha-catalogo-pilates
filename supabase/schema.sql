-- Schema for Alenka Rocha - Catálogo de Pilates
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query > Run).

create table if not exists public.categories (
  id text primary key,
  name text not null,
  icon text not null,
  color text
);

create table if not exists public.exercises (
  id text primary key,
  name text not null,
  "videoUrl" text not null,
  "categoryId" text not null references public.categories(id) on delete cascade,
  "categoryName" text not null,
  intensity text not null,
  "typeTag" text not null,
  description text not null,
  "detailedNotes" text,
  icon text not null,
  "imageUrl" text not null,
  "createdAt" timestamptz not null default now(),
  tags text[]
);

alter table public.categories enable row level security;
alter table public.exercises enable row level security;

-- Catalog is public and has no login: allow anyone (the published site) to
-- read and write. Revisit this if login-gated editing is added later.
drop policy if exists "Public full access categories" on public.categories;
create policy "Public full access categories" on public.categories
  for all using (true) with check (true);

drop policy if exists "Public full access exercises" on public.exercises;
create policy "Public full access exercises" on public.exercises
  for all using (true) with check (true);

-- Seed data (matches src/data/initialData.ts). Safe to re-run.
insert into public.categories (id, name, icon) values
  ('mobilidade', 'Mobilidade de Coluna', 'accessibility'),
  ('core', 'Fortalecimento Core', 'fitness_center'),
  ('inferiores', 'Membros Inferiores', 'directions_walk'),
  ('costas', 'Costas & Postura', 'back_hand'),
  ('alongamento', 'Alongamento Global', 'self_improvement'),
  ('corpo_inteiro', 'Corpo Inteiro', 'sports_gymnastics')
on conflict (id) do nothing;

insert into public.exercises
  (id, name, "videoUrl", "categoryId", "categoryName", intensity, "typeTag", description, "detailedNotes", icon, "imageUrl", "createdAt", tags)
values
  (
    'the-hundred', 'The Hundred', 'https://www.youtube.com/watch?v=kYJzX3m4_dM',
    'core', 'Abdômen', 'iniciante', 'Pilates Solo',
    'O ''The Hundred'' é um exercício clássico de Pilates focado no aquecimento do corpo e fortalecimento do core. Ele estimula a circulação sanguínea e prepara a respiração para os movimentos seguintes.',
    E'Instruções de Execução:\n1. Deite-se de costas no colchonete com os braços estendidos ao longo do corpo.\n2. Eleve as pernas em posição "mesa" (table top) ou a 45 graus com controle.\n3. Flexione a cabeça e o tronco superior retirando as escápulas do chão.\n4. Bombeie os braços vigorosamente para cima e para baixo enquanto inspira por 5 tempos e expira por 5 tempos, completando 10 ciclos (100 batimentos).',
    'person', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    '2026-01-10T10:00:00.000Z', array['Abdômen','Aquecimento','Respiração']
  ),
  (
    'roll-up', 'Roll Up', 'https://www.youtube.com/watch?v=Yf9pX6z0P5w',
    'core', 'Corpo Inteiro', 'intermediario', 'Pilates Solo',
    'O Roll Up é um dos movimentos fundamentais para mobilização vertebral e força abdominal profunda. Trabalha o alongamento da cadeia posterior com total controle e fluidez.',
    E'Instruções de Execução:\n1. Deite-se em decúbito dorsal com pernas estendidas e calcanhares juntos.\n2. Estenda os braços acima da cabeça mantendo as costelas conectadas.\n3. Inspire trazendo os braços para a linha dos ombros, queixo ao peito.\n4. Expire articulando vértebra por vértebra, enrolando o tronco até alcançar os pés em forma de "C".',
    'self_improvement', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
    '2026-01-12T11:30:00.000Z', array['Corpo Inteiro','Flexibilidade','Mobilidade']
  ),
  (
    'single-leg-stretch', 'Single Leg Stretch', 'https://www.youtube.com/watch?v=r32qC7g0tTg',
    'inferiores', 'Pernas', 'iniciante', 'Pilates Solo',
    'Exercício da série clássica de abdominais do Pilates. Focado na dissociação dos membros inferiores mantendo a estabilidade da pelve e alinhamento neutro da lombar.',
    E'Instruções de Execução:\n1. Deite-se com joelhos flexionados no peito e tronco superior elevado.\n2. Abrace o joelho direito com as duas mãos enquanto estende a perna esquerda a 45 graus.\n3. Alterne as pernas com controle dinâmico, mantendo o abdômen contraído e a pelve estável.\n4. Mantenha os cotovelos ligeiramente abertos e a respiração ritmada.',
    'directions_walk', 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1000&q=80',
    '2026-01-15T09:15:00.000Z', array['Pernas','Abdômen','Coordenação']
  ),
  (
    'swan-dive', 'Swan Dive', 'https://www.youtube.com/watch?v=kYJzX3m4_dM',
    'costas', 'Costas', 'avancado', 'Pilates Aparelho & Solo',
    'Movimento avançado de extensão da coluna vertebral que fortalece intensamente os eretores da espinha, glúteos e abre a caixa torácica contraindo a cadeia extensora.',
    E'Instruções de Execução:\n1. Deite-se de bruços com as mãos apoiadas sob os ombros e pernas ligeiramente afastadas.\n2. Inspire enquanto empurra o chão e eleva o peito em extensão torácica longa.\n3. No nível avançado, balance o corpo à frente mantendo a curvatura e balance os braços.\n4. Mantenha o pescoço em linha com a coluna sem hiperextensão cervical.',
    'accessibility', 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1000&q=80',
    '2026-01-18T14:40:00.000Z', array['Costas','Postura','Avançado']
  ),
  (
    'criss-cross', 'Criss Cross', 'https://www.youtube.com/watch?v=Yf9pX6z0P5w',
    'core', 'Abdômen', 'intermediario', 'Pilates Solo',
    'Excelente para tonificar os músculos oblíquos internos e externos, além de melhorar a coordenação respiratória durante a rotação da cintura escapular.',
    E'Instruções de Execução:\n1. Mãos atrás da nuca sem puxar a cabeça.\n2. Gire a axila esquerda em direção ao joelho direito enquanto a perna esquerda estende.\n3. Mantenha a pelve totalmente firme no solo e alterne os lados de forma controlada.',
    'fitness_center', 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1000&q=80',
    '2026-01-20T16:00:00.000Z', array['Abdômen','Oblíquos','Core']
  ),
  (
    'spine-stretch-forward', 'Spine Stretch Forward', 'https://www.youtube.com/watch?v=r32qC7g0tTg',
    'mobilidade', 'Mobilidade de Coluna', 'iniciante', 'Pilates Solo',
    'Promove a descompressão dos discos vertebrais, alonga os isquiotibiais e reeduca a postura ereta na posição sentada.',
    E'Instruções de Execução:\n1. Sente-se ereto com as pernas estendidas na largura dos ombros.\n2. Braços paralelos ao chão na altura dos ombros.\n3. Inspire crescendo para o teto e expire mergulhando para frente pelo topo da cabeça.',
    'self_improvement', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80',
    '2026-01-22T08:20:00.000Z', array['Mobilidade','Alongamento','Coluna']
  )
on conflict (id) do nothing;
