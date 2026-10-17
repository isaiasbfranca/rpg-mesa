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

-- A mestra remove jogadores e cada jogador pode sair; a mestra nunca sai da própria campanha.
drop policy if exists "mestra remove ou jogador sai" on public.mesa_members;
create policy "mestra remove ou jogador sai" on public.mesa_members
  for delete to authenticated using (role = 'jogador' and (user_id = auth.uid() or public.mesa_is_master(campaign_id)));

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

-- Jogo ao vivo (US-40 e US-41). A mestra abre e encerra a sessão; toda rolagem ao vivo é sorteada aqui,
-- no servidor, e só entra na tabela pela função mesa_live_roll, então o cliente não consegue forjar resultado.
create table if not exists public.mesa_live_sessions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null,
  started_by uuid not null default auth.uid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create unique index if not exists mesa_live_one_active on public.mesa_live_sessions (campaign_id) where ended_at is null;

create table if not exists public.mesa_live_rolls (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mesa_live_sessions (id) on delete cascade,
  campaign_id uuid not null,
  user_id uuid not null,
  author_name text not null,
  roll jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists mesa_live_rolls_session_idx on public.mesa_live_rolls (session_id, created_at);

alter table public.mesa_live_sessions enable row level security;
alter table public.mesa_live_rolls enable row level security;

drop policy if exists "participantes veem sessões ao vivo" on public.mesa_live_sessions;
create policy "participantes veem sessões ao vivo" on public.mesa_live_sessions
  for select to authenticated using (public.mesa_is_member(campaign_id));

drop policy if exists "participantes veem rolagens ao vivo" on public.mesa_live_rolls;
create policy "participantes veem rolagens ao vivo" on public.mesa_live_rolls
  for select to authenticated using (public.mesa_is_member(campaign_id));

grant select on public.mesa_live_sessions, public.mesa_live_rolls to authenticated;

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.mesa_live_sessions; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.mesa_live_rolls; exception when duplicate_object then null; end;
  end if;
end $$;

-- Inteiro uniforme em [1, sides] a partir de bytes aleatórios do servidor, com rejeição para evitar viés de módulo.
create or replace function public.mesa_random_int(sides int) returns int
language plpgsql volatile set search_path = public as $$
declare lim bigint := 4294967296 - (4294967296 % sides); v bigint; b bytea;
begin
  loop
    b := uuid_send(gen_random_uuid());
    v := get_byte(b, 0)::bigint * 16777216 + get_byte(b, 1) * 65536 + get_byte(b, 2) * 256 + get_byte(b, 3);
    if v < lim then return (v % sides)::int + 1; end if;
  end loop;
end $$;

create or replace function public.mesa_live_start(cid uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare sid uuid;
begin
  if not public.mesa_is_master(cid) then raise exception 'Só a mestra abre a sessão ao vivo.'; end if;
  select id into sid from public.mesa_live_sessions where campaign_id = cid and ended_at is null;
  if found then return sid; end if;
  insert into public.mesa_live_sessions (campaign_id, started_by) values (cid, auth.uid()) returning id into sid;
  return sid;
end $$;

create or replace function public.mesa_live_end(sid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  select campaign_id into cid from public.mesa_live_sessions where id = sid and ended_at is null;
  if not found then return; end if;
  if not public.mesa_is_master(cid) then raise exception 'Só a mestra encerra a sessão ao vivo.'; end if;
  update public.mesa_live_sessions set ended_at = now() where id = sid;
end $$;

-- spec: {"dice":[{"count":2,"sides":6,"sign":1}],"modifier":3}. A expressão só é guardada para exibir.
create or replace function public.mesa_live_roll(sid uuid, spec jsonb, roll_mode text, expr text, roll_label text, char_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  sess public.mesa_live_sessions; who text; term jsonb; n_dice int := 0; n_terms int := 0; flat int;
  tries int; attempt int; rolls jsonb; vals jsonb; total int; subtotal int; v int; i int;
  attempts jsonb := '[]'::jsonb; totals int[] := '{}'; kept int; result jsonb; row_id uuid;
begin
  select * into sess from public.mesa_live_sessions where id = sid and ended_at is null;
  if not found then raise exception 'Não há sessão ao vivo aberta.'; end if;
  if not public.mesa_is_member(sess.campaign_id) then raise exception 'Você não participa desta campanha.'; end if;
  if roll_mode not in ('normal', 'vantagem', 'desvantagem') then raise exception 'Modo de rolagem inválido.'; end if;
  if jsonb_typeof(spec -> 'dice') <> 'array' or jsonb_array_length(spec -> 'dice') not between 1 and 10 then
    raise exception 'Rolagem inválida.';
  end if;
  flat := coalesce((spec ->> 'modifier')::int, 0);
  if flat not between -10000 and 10000 then raise exception 'Rolagem inválida.'; end if;
  for term in select * from jsonb_array_elements(spec -> 'dice') loop
    if (term ->> 'count')::int not between 1 and 100 or (term ->> 'sides')::int not between 2 and 1000
       or (term ->> 'sign')::int not in (1, -1) then
      raise exception 'Rolagem inválida.';
    end if;
    n_dice := n_dice + (term ->> 'count')::int;
  end loop;
  if n_dice > 100 then raise exception 'Use no máximo 100 dados por rolagem.'; end if;

  tries := case when roll_mode = 'normal' then 1 else 2 end;
  for attempt in 1..tries loop
    rolls := '[]'::jsonb; subtotal := 0;
    for term in select * from jsonb_array_elements(spec -> 'dice') loop
      vals := '[]'::jsonb;
      for i in 1..(term ->> 'count')::int loop
        v := public.mesa_random_int((term ->> 'sides')::int);
        vals := vals || to_jsonb(v);
        subtotal := subtotal + (term ->> 'sign')::int * v;
      end loop;
      rolls := rolls || jsonb_build_object('sides', (term ->> 'sides')::int, 'sign', (term ->> 'sign')::int, 'values', vals);
    end loop;
    total := subtotal + flat;
    totals := totals || total;
    attempts := attempts || jsonb_build_object('rolls', rolls, 'modifier', flat, 'total', total);
  end loop;
  kept := case when roll_mode = 'desvantagem' then (select min(t) from unnest(totals) t) else (select max(t) from unnest(totals) t) end;

  select coalesce(display_name, case when role = 'mestra' then 'Mestra' else 'Jogador' end) into who
    from public.mesa_members where campaign_id = sess.campaign_id and user_id = auth.uid();
  result := jsonb_build_object('expression', left(coalesce(expr, ''), 100), 'mode', roll_mode, 'attempts', attempts, 'total', kept,
    'rolledAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'authorName', who);
  if roll_label is not null and roll_label <> '' then result := result || jsonb_build_object('label', left(roll_label, 80)); end if;
  if char_id is not null and char_id <> '' then result := result || jsonb_build_object('characterId', left(char_id, 64)); end if;
  insert into public.mesa_live_rolls (session_id, campaign_id, user_id, author_name, roll)
    values (sid, sess.campaign_id, auth.uid(), who, result) returning id into row_id;
  return result || jsonb_build_object('id', row_id);
end $$;

revoke all on function public.mesa_live_start(uuid) from public;
revoke all on function public.mesa_live_end(uuid) from public;
revoke all on function public.mesa_live_roll(uuid, jsonb, text, text, text, text) from public;
revoke all on function public.mesa_random_int(int) from public;
grant execute on function public.mesa_live_start(uuid) to authenticated;
grant execute on function public.mesa_live_end(uuid) to authenticated;
grant execute on function public.mesa_live_roll(uuid, jsonb, text, text, text, text) to authenticated;
