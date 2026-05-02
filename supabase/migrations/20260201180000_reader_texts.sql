-- The Classic Reader: works, chapter segments (JSON), per-word studies.
-- Apply in Supabase: SQL Editor → New query, or `supabase db push` with CLI.

create table public.works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  translator text not null,
  license_note text not null,
  created_at timestamptz not null default now()
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  chapter_number int not null,
  paragraphs jsonb not null,
  unique (work_id, chapter_number)
);

create index chapters_work_id_idx on public.chapters (work_id);

create table public.word_studies (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  word_key text not null,
  label text not null,
  hanzi text,
  pinyin text,
  tagline text not null,
  body jsonb not null,
  alternate_translations text[] not null default '{}',
  unique (work_id, word_key)
);

create index word_studies_work_id_idx on public.word_studies (work_id);

alter table public.works enable row level security;
alter table public.chapters enable row level security;
alter table public.word_studies enable row level security;

create policy "works_select_public" on public.works for select using (true);

create policy "chapters_select_public" on public.chapters for select using (true);

create policy "word_studies_select_public" on public.word_studies for select using (true);
