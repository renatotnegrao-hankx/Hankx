-- =====================================================================
--  HANKX Finanças — banco de dados (Supabase)
--  Cole TUDO no Supabase: menu "SQL Editor" → "New query" → colar → "Run".
--  Pode rodar de novo sem problema.
-- =====================================================================

-- 1) Perfil de cada usuário
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text,
  created_at timestamptz not null default now()
);

-- 2) Dados financeiros de cada usuário (o app guarda tudo em um único JSON)
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3) Segurança: cada pessoa só enxerga e altera o que é dela
alter table public.profiles  enable row level security;
alter table public.user_data enable row level security;

drop policy if exists "perfil: ler o próprio"      on public.profiles;
drop policy if exists "perfil: editar o próprio"   on public.profiles;
drop policy if exists "dados: ler os próprios"     on public.user_data;
drop policy if exists "dados: criar os próprios"   on public.user_data;
drop policy if exists "dados: alterar os próprios" on public.user_data;

create policy "perfil: ler o próprio"      on public.profiles  for select using (auth.uid() = id);
create policy "perfil: editar o próprio"   on public.profiles  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "dados: ler os próprios"     on public.user_data for select using (auth.uid() = user_id);
create policy "dados: criar os próprios"   on public.user_data for insert with check (auth.uid() = user_id);
create policy "dados: alterar os próprios" on public.user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) "Excluir minha conta": apaga a conta e todos os dados
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
