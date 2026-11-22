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

-- 6) Permissões para o app ler e gravar (necessário em projetos novos do Supabase)
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.user_data to authenticated;
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;

-- =====================================================================
--  PARTE 2 — Planos Premium, pagamentos e painel do administrador
--  (se já rodou a parte 1 antes, pode rodar o arquivo inteiro de novo)
-- =====================================================================

-- 7) Premium no perfil
alter table public.profiles add column if not exists trial_ends_at timestamptz not null default (now() + interval '7 days');
alter table public.profiles add column if not exists premium_until timestamptz;
alter table public.profiles add column if not exists plan          text;   -- mensal | anual | vitalicio | cortesia
alter table public.profiles add column if not exists provider      text;   -- mercadopago | googleplay | admin
alter table public.profiles add column if not exists provider_ref  text;

-- o usuário só pode mudar o próprio nome; Premium e teste só o servidor/admin altera
revoke update on public.profiles from authenticated, anon;
grant  update (name) on public.profiles to authenticated;

-- 8) Pagamentos recebidos (só o servidor grava; ninguém lê direto)
create table if not exists public.payments (
  id          bigserial primary key,
  user_id     uuid,
  email       text,
  provider    text,
  plan        text,
  amount      numeric(10,2) not null default 0,
  status      text,
  external_id text unique,
  payload     jsonb,
  created_at  timestamptz not null default now()
);
alter table public.payments enable row level security;

-- 9) Quem é administrador (somente este e-mail, confirmado)
--    O e-mail do administrador fica na tabela "admins" (cadastre com o comando do guia).
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;   -- sem regras: ninguém lê pelo app

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (select 1 from auth.users u join public.admins a on lower(a.email) = lower(u.email)
                 where u.id = auth.uid() and u.email_confirmed_at is not null);
$$;

-- 10) Números do app para o painel
create or replace function public.admin_stats()
returns json language plpgsql stable security definer set search_path = public as $$
declare r json;
begin
  if not public.is_admin() then raise exception 'acesso negado'; end if;
  with a as (select * from profiles where premium_until > now())
  select json_build_object(
    'users',        (select count(*) from profiles),
    'new_7d',       (select count(*) from profiles where created_at > now() - interval '7 days'),
    'new_30d',      (select count(*) from profiles where created_at > now() - interval '30 days'),
    'active_7d',    (select count(*) from user_data where updated_at > now() - interval '7 days'),
    'trial',        (select count(*) from profiles where trial_ends_at > now() and (premium_until is null or premium_until <= now())),
    'mensal',       (select count(*) from a where plan = 'mensal'),
    'anual',        (select count(*) from a where plan = 'anual'),
    'vitalicio',    (select count(*) from a where plan = 'vitalicio'),
    'cortesia',     (select count(*) from a where plan = 'cortesia'),
    'mrr',          round((select count(*) from a where plan = 'mensal') * 9.90 + (select count(*) from a where plan = 'anual') * 89.90 / 12, 2),
    'revenue_total',(select coalesce(sum(amount),0) from payments where status = 'approved'),
    'revenue_month',(select coalesce(sum(amount),0) from payments where status = 'approved' and created_at >= date_trunc('month', now())),
    'revenue_30d',  (select coalesce(sum(amount),0) from payments where status = 'approved' and created_at > now() - interval '30 days'),
    'by_month',     (select coalesce(json_agg(x order by x.m), '[]'::json) from (
                       select to_char(gs, 'YYYY-MM') m,
                              (select coalesce(sum(amount),0) from payments p where p.status='approved' and date_trunc('month', p.created_at) = gs) v,
                              (select count(*) from profiles pr where date_trunc('month', pr.created_at) = gs) u
                       from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') gs) x),
    'recent',       (select coalesce(json_agg(y), '[]'::json) from (
                       select email, plan, provider, amount, created_at from payments where status='approved' order by created_at desc limit 10) y)
  ) into r;
  return r;
end $$;

-- 11) Lista de usuários para o painel
create or replace function public.admin_users(q text default '')
returns table (id uuid, email text, name text, created_at timestamptz, trial_ends_at timestamptz,
               premium_until timestamptz, plan text, provider text, last_active timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'acesso negado'; end if;
  return query
    select p.id, p.email, p.name, p.created_at, p.trial_ends_at, p.premium_until, p.plan, p.provider, d.updated_at
    from profiles p left join user_data d on d.user_id = p.id
    where coalesce(q,'') = '' or p.email ilike '%'||q||'%' or p.name ilike '%'||q||'%'
    order by p.created_at desc limit 300;
end $$;

-- 12) Dar ou tirar Premium de cortesia (30d | 90d | 1y | vitalicio | remover)
create or replace function public.admin_grant(target uuid, mode text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'acesso negado'; end if;
  if mode = 'remover' then
    update profiles set premium_until = null, plan = null, provider = null, provider_ref = null where id = target;
  else
    update profiles set
      premium_until = case mode when '30d' then now() + interval '30 days'
                                when '90d' then now() + interval '90 days'
                                when '1y'  then now() + interval '1 year'
                                else '9999-12-31'::timestamptz end,
      plan = 'cortesia', provider = 'admin', provider_ref = mode
    where id = target;
  end if;
end $$;

revoke all on function public.admin_stats()            from public, anon;
revoke all on function public.admin_users(text)        from public, anon;
revoke all on function public.admin_grant(uuid, text)  from public, anon;
grant execute on function public.is_admin()            to authenticated;
grant execute on function public.admin_stats()         to authenticated;
grant execute on function public.admin_users(text)     to authenticated;
grant execute on function public.admin_grant(uuid,text) to authenticated;
