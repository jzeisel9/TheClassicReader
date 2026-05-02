-- Many English (or Latin-script) surface forms per work → one word_study (word_key).

create table public.word_study_aliases (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  word_key text not null,
  alias text not null,
  created_at timestamptz not null default now(),
  foreign key (work_id, word_key)
    references public.word_studies (work_id, word_key)
    on delete cascade
);

create unique index word_study_aliases_work_lower_alias_idx
  on public.word_study_aliases (work_id, lower(alias));

create index word_study_aliases_work_id_idx on public.word_study_aliases (work_id);

alter table public.word_study_aliases enable row level security;

create policy "word_study_aliases_select_public"
  on public.word_study_aliases for select using (true);
