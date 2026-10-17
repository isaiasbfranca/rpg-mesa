-- Rode no Supabase (SQL Editor) ou pela ação "Aplicar esquema do Supabase". Pode rodar mais de uma vez.
-- Cada campanha, personagem, sessão, nota e convite é um documento JSON. Quem cria é o dono (user_id);
-- os participantes da campanha enxergam o que as regras abaixo permitem.

create table if not exists public.mesa_docs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('campaign', 'character', 'sessionLog', 'note', 'invite')),
  id uuid not null,
  campaign_id uuid,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, id)
);

create index if not exists mesa_docs_campaign_idx on public.mesa_docs (kind, campaign_id);
create index if not exists mesa_docs_invite_token_idx on public.mesa_docs ((data ->> 'token')) where kind = 'invite';

create table if not exists public.mesa_members (
  campaign_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role text not null check (role in ('mestra', 'jogador')),
  display_name text,
  joined_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

alter table public.mesa_docs enable row level security;
alter table public.mesa_members enable row level security;

-- Campanhas criadas antes dos convites: o dono vira mestra.
insert into public.mesa_members (campaign_id, user_id, role)
select id, user_id, 'mestra' from public.mesa_docs where kind = 'campaign'
on conflict do nothing;

-- Funções com security definer evitam que as regras da tabela chamem a si mesmas.
create or replace function public.mesa_is_member(cid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.mesa_members where campaign_id = cid and user_id = auth.uid())
$$;

create or replace function public.mesa_is_master(cid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.mesa_members where campaign_id = cid and user_id = auth.uid() and role = 'mestra')
$$;

-- Participantes: cada um vê quem está na mesma campanha; só a mestra cria o próprio vínculo (o jogador entra pelo convite).
drop policy if exists "participantes veem a mesa" on public.mesa_members;
create policy "participantes veem a mesa" on public.mesa_members
  for select to authenticated using (public.mesa_is_member(campaign_id));

drop policy if exists "dono da campanha vira mestra" on public.mesa_members;
create policy "dono da campanha vira mestra" on public.mesa_members
  for insert to authenticated with check (
    user_id = auth.uid() and role = 'mestra' and exists (
      select 1 from public.mesa_docs d where d.kind = 'campaign' and d.id = campaign_id and d.user_id = auth.uid())
  );

drop policy if exists "mestra remove ou jogador sai" on public.mesa_members;
create policy "mestra remove ou jogador sai" on public.mesa_members
  for delete to authenticated using (user_id = auth.uid() or public.mesa_is_master(campaign_id));

-- Documentos.
drop policy if exists "dono acessa os próprios documentos" on public.mesa_docs;
drop policy if exists "ver documentos" on public.mesa_docs;
create policy "ver documentos" on public.mesa_docs
  for select to authenticated using (
    user_id = auth.uid()
    or (campaign_id is not null and public.mesa_is_member(campaign_id) and (
      kind in ('campaign', 'sessionLog')
      or (kind = 'character' and (coalesce((data ->> 'hidden')::boolean, false) = false or public.mesa_is_master(campaign_id)))
      or (kind = 'note' and data ->> 'visibility' = 'campanha')
    ))
  );

drop policy if exists "criar documentos" on public.mesa_docs;
create policy "criar documentos" on public.mesa_docs
  for insert to authenticated with check (
    user_id = auth.uid() and (
      kind = 'campaign'
      or (campaign_id is not null and public.mesa_is_member(campaign_id)
          and (kind in ('character', 'note') or public.mesa_is_master(campaign_id)))
    )
  );

drop policy if exists "editar documentos" on public.mesa_docs;
create policy "editar documentos" on public.mesa_docs
  for update to authenticated
  using (user_id = auth.uid() or (kind = 'character' and public.mesa_is_master(campaign_id)))
  with check (user_id = auth.uid() or (kind = 'character' and public.mesa_is_master(campaign_id)));

drop policy if exists "apagar documentos" on public.mesa_docs;
create policy "apagar documentos" on public.mesa_docs
  for delete to authenticated using (
    user_id = auth.uid()
    or (public.mesa_is_master(campaign_id)
        and (kind = 'character' or (kind = 'note' and data ->> 'visibility' = 'campanha')))
  );

-- Convites: quem tem o link ainda não participa da campanha, então a leitura e o aceite passam por estas funções.
create or replace function public.mesa_invite_preview(invite_token text) returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare inv public.mesa_docs; camp public.mesa_docs;
begin
  select * into inv from public.mesa_docs where kind = 'invite' and data ->> 'token' = invite_token limit 1;
  if not found then return null; end if;
  select * into camp from public.mesa_docs where kind = 'campaign' and id = inv.campaign_id;
  if not found then return null; end if;
  return jsonb_build_object('invite', inv.data, 'campaign', camp.data);
end $$;

create or replace function public.mesa_accept_invite(invite_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare inv public.mesa_docs; accepted jsonb; who text;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para aceitar o convite.'; end if;
  select * into inv from public.mesa_docs
    where kind = 'invite' and data ->> 'token' = invite_token and data ->> 'status' = 'pendente' limit 1;
  if not found then return null; end if;
  select raw_user_meta_data ->> 'display_name' into who from auth.users where id = auth.uid();
  insert into public.mesa_members (campaign_id, user_id, role, display_name)
    values (inv.campaign_id, auth.uid(), 'jogador', who) on conflict do nothing;
  accepted := jsonb_set(inv.data, '{status}', '"aceito"');
  update public.mesa_docs set data = accepted, updated_at = now()
    where user_id = inv.user_id and kind = 'invite' and id = inv.id;
  return accepted;
end $$;

revoke all on function public.mesa_invite_preview(text) from public;
revoke all on function public.mesa_accept_invite(text) from public;
grant execute on function public.mesa_invite_preview(text) to authenticated;
grant execute on function public.mesa_accept_invite(text) to authenticated;
