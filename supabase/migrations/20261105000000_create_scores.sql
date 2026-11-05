-- BLOCKFALL scores table
create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  name       text        not null check (char_length(name) between 1 and 12),
  score      integer     not null check (score >= 0),
  lines      integer     not null default 0 check (lines >= 0),
  level      integer     not null default 1 check (level >= 1),
  created_at timestamptz not null default now()
);

create index if not exists scores_score_idx on public.scores (score desc, id asc);

-- Only the server (secret key) reads/writes; no public access through the anon key.
alter table public.scores enable row level security;
revoke all on public.scores from anon, authenticated;
