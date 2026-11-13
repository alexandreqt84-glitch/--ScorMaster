-- ScoreMaster : partage des parties entre comptes. À coller dans Supabase > SQL Editor > Run (même si supabase.sql a déjà été exécuté).
alter table public.parties add column if not exists players text[] not null default '{}';
create index if not exists parties_players_idx on public.parties using gin (players);

drop policy if exists "parties perso" on public.parties;
drop policy if exists "parties lecture" on public.parties;
drop policy if exists "parties ecriture" on public.parties;
drop policy if exists "parties modif" on public.parties;
drop policy if exists "parties suppr" on public.parties;

-- je vois mes parties ET celles où mon pseudo (la partie avant @ de mon identifiant) figure parmi les joueurs
create policy "parties lecture" on public.parties for select to authenticated
  using (owner = auth.uid() or split_part(auth.jwt()->>'email', '@', 1) = any(players));
-- seul le créateur de la partie peut l'écrire, la modifier ou la supprimer
create policy "parties ecriture" on public.parties for insert to authenticated with check (owner = auth.uid());
create policy "parties modif"    on public.parties for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "parties suppr"    on public.parties for delete to authenticated using (owner = auth.uid());
