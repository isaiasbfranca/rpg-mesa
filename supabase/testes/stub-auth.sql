-- Simula o mínimo do Supabase para rodar schema.sql num Postgres comum.
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}'::jsonb);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
grant usage on schema auth, public to authenticated;
