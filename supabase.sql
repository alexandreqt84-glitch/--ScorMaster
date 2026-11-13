-- ScoreMaster : tables des comptes joueurs. À coller dans Supabase > SQL Editor > Run.

create table if not exists public.parties (
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner, id)
);
create table if not exists public.reglages (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  entries jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  pseudo text not null,
  avatar text,
  stats jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.parties  enable row level security;
alter table public.reglages enable row level security;
alter table public.profiles enable row level security;

-- chacun ne voit et ne modifie que SES parties et SES réglages
drop policy if exists "parties perso"  on public.parties;
drop policy if exists "reglages perso" on public.reglages;
create policy "parties perso"  on public.parties  for all to authenticated using (owner = auth.uid())   with check (owner = auth.uid());
create policy "reglages perso" on public.reglages for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- le classement général est lisible par tous les joueurs connectés ; chacun ne modifie que son profil
drop policy if exists "profils lisibles" on public.profiles;
drop policy if exists "profil perso"     on public.profiles;
create policy "profils lisibles" on public.profiles for select to authenticated using (true);
create policy "profil perso"     on public.profiles for all    to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
