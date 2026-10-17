\set ON_ERROR_STOP off
\pset format unaligned
\pset tuples_only on
grant select, insert, update, delete on public.mesa_docs, public.mesa_members to authenticated;

insert into auth.users (id, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', '{"display_name":"Mestra"}'),
  ('00000000-0000-0000-0000-00000000000b', '{"display_name":"Jogador"}'),
  ('00000000-0000-0000-0000-00000000000c', '{"display_name":"Estranha"}');

create temp table resultados (caso text, esperado text, obtido text);
grant all on resultados to authenticated;

-- Executa uma consulta como um usuário e devolve a contagem de linhas afetadas/visíveis.
create or replace function pg_temp.como(uid text, sql text) returns text language plpgsql as $$
declare n int;
begin
  perform set_config('request.jwt.claim.sub', uid, false);
  set local role authenticated;
  begin
    execute sql;
    get diagnostics n = row_count;
    reset role;
    return n::text;
  exception when others then
    reset role;
    return 'ERRO';
  end;
end $$;

\set A '00000000-0000-0000-0000-00000000000a'
\set B '00000000-0000-0000-0000-00000000000b'
\set C '00000000-0000-0000-0000-00000000000c'
\set CAMP '11111111-1111-1111-1111-111111111111'

-- Mestra cria campanha, vínculo, sessão, nota privada da mestra, nota pública, NPC oculto, convite.
select set_config('request.jwt.claim.sub', :'A', false);
set role authenticated;
insert into public.mesa_docs (kind, id, campaign_id, data) values ('campaign', :'CAMP', :'CAMP', '{"id":"11111111-1111-1111-1111-111111111111","status":"ativa"}');
insert into public.mesa_members (campaign_id, role) values (:'CAMP', 'mestra');
insert into public.mesa_docs (kind, id, campaign_id, data) values
  ('sessionLog', '22222222-2222-2222-2222-222222222221', :'CAMP', '{"title":"s1"}'),
  ('note', '33333333-3333-3333-3333-333333333331', :'CAMP', '{"visibility":"privada","authorId":"a"}'),
  ('note', '33333333-3333-3333-3333-333333333332', :'CAMP', '{"visibility":"campanha","authorId":"a"}'),
  ('character', '44444444-4444-4444-4444-444444444441', :'CAMP', '{"kind":"npc","hidden":true,"name":"Vilão"}'),
  ('invite', '55555555-5555-5555-5555-555555555551', :'CAMP', '{"token":"tok123","status":"pendente","campaignId":"11111111-1111-1111-1111-111111111111"}');
reset role;

-- Antes do aceite, B não vê nada e o convite aparece só pela função de pré-visualização.
insert into resultados select 'B sem vínculo não vê a campanha', '0', pg_temp.como(:'B', 'select 1 from public.mesa_docs where kind=''campaign''');
select set_config('request.jwt.claim.sub', :'B', false);
set role authenticated;
insert into resultados select 'B pré-visualiza convite válido', 'sim', case when public.mesa_invite_preview('tok123') is not null then 'sim' else 'não' end;
insert into resultados select 'Convite inexistente não revela nada', 'sim', case when public.mesa_invite_preview('nada') is null then 'sim' else 'não' end;
insert into resultados select 'B aceita convite', 'aceito', public.mesa_accept_invite('tok123') ->> 'status';
insert into resultados select 'Convite aceito não pode ser reutilizado', 'sim', case when public.mesa_accept_invite('tok123') is null then 'sim' else 'não' end;
reset role;

insert into resultados select 'B vira jogador', 'jogador', (select role from public.mesa_members where user_id = :'B');
insert into resultados select 'B vê campanha e sessão', '2', pg_temp.como(:'B', 'select 1 from public.mesa_docs where kind in (''campaign'',''sessionLog'')');
insert into resultados select 'B não vê nota privada da mestra', '1', pg_temp.como(:'B', 'select 1 from public.mesa_docs where kind=''note''');
insert into resultados select 'B não vê NPC oculto', '0', pg_temp.como(:'B', 'select 1 from public.mesa_docs where kind=''character''');
insert into resultados select 'B não vê convites', '0', pg_temp.como(:'B', 'select 1 from public.mesa_docs where kind=''invite''');
insert into resultados select 'B não cria sessão', 'ERRO', pg_temp.como(:'B', format('insert into public.mesa_docs (kind,id,campaign_id,data) values (''sessionLog'',''66666666-6666-6666-6666-666666666661'',%L,''{}'')', :'CAMP'));
insert into resultados select 'B não edita a sessão da mestra', '0', pg_temp.como(:'B', 'update public.mesa_docs set data = ''{"title":"hack"}'' where kind=''sessionLog''');
insert into resultados select 'B não apaga a sessão da mestra', '0', pg_temp.como(:'B', 'delete from public.mesa_docs where kind=''sessionLog''');
insert into resultados select 'B não arquiva a campanha', '0', pg_temp.como(:'B', 'update public.mesa_docs set data = ''{"status":"arquivada"}'' where kind=''campaign''');
insert into resultados select 'B não se promove a mestra', '0', pg_temp.como(:'B', format('update public.mesa_members set role=''mestra'' where user_id=%L', :'B'));
insert into resultados select 'B cria o próprio personagem', '1', pg_temp.como(:'B', format('insert into public.mesa_docs (kind,id,campaign_id,data) values (''character'',''77777777-7777-7777-7777-777777777771'',%L,''{"hidden":false,"kind":"pj"}'')', :'CAMP'));
insert into resultados select 'Mestra edita ficha do jogador', '1', pg_temp.como(:'A', 'update public.mesa_docs set data = ''{"hidden":false,"kind":"pj","name":"x"}'' where id=''77777777-7777-7777-7777-777777777771''');
insert into resultados select 'Mestra apaga ficha do jogador', '1', pg_temp.como(:'A', 'delete from public.mesa_docs where id=''77777777-7777-7777-7777-777777777771''');
insert into resultados select 'Mestra edita e arquiva a própria campanha', '1', pg_temp.como(:'A', 'update public.mesa_docs set data = ''{"status":"arquivada"}'' where kind=''campaign''');
insert into resultados select 'Mestra edita sessão', '1', pg_temp.como(:'A', 'update public.mesa_docs set data = ''{"title":"s1 editada"}'' where kind=''sessionLog''');
insert into resultados select 'Mestra apaga sessão', '1', pg_temp.como(:'A', 'delete from public.mesa_docs where kind=''sessionLog''');

-- Participantes e remoção (US-06).
insert into resultados select 'B vê a lista de participantes', '2', pg_temp.como(:'B', format('select 1 from public.mesa_members where campaign_id = %L', :'CAMP'));
insert into resultados select 'Mestra não se remove da campanha', '0', pg_temp.como(:'A', format('delete from public.mesa_members where user_id = %L', :'A'));
insert into resultados select 'B não remove a mestra', '0', pg_temp.como(:'B', format('delete from public.mesa_members where user_id = %L', :'A'));
insert into resultados select 'Mestra remove o jogador', '1', pg_temp.como(:'A', format('delete from public.mesa_members where user_id = %L and role = ''jogador''', :'B'));
insert into resultados select 'Jogador removido não vê mais a campanha', '0', pg_temp.como(:'B', 'select 1 from public.mesa_docs');
insert into resultados select 'Jogador removido não vê mais os participantes', '0', pg_temp.como(:'B', 'select 1 from public.mesa_members');

-- Estranha (sem convite).
insert into resultados select 'Estranha não vê nada', '0', pg_temp.como(:'C', 'select 1 from public.mesa_docs');
insert into resultados select 'Estranha não vê participantes', '0', pg_temp.como(:'C', 'select 1 from public.mesa_members');
insert into resultados select 'Estranha não cria sessão na campanha alheia', 'ERRO', pg_temp.como(:'C', format('insert into public.mesa_docs (kind,id,campaign_id,data) values (''sessionLog'',''66666666-6666-6666-6666-666666666662'',%L,''{}'')', :'CAMP'));
insert into resultados select 'Estranha não vira mestra da campanha alheia', 'ERRO', pg_temp.como(:'C', format('insert into public.mesa_members (campaign_id, role) values (%L, ''mestra'')', :'CAMP'));
insert into public.mesa_docs (user_id, kind, id, campaign_id, data) values ('00000000-0000-0000-0000-00000000000a','invite','55555555-5555-5555-5555-555555555552','11111111-1111-1111-1111-111111111111','{"token":"tok999","status":"pendente"}');
insert into resultados select 'Mestra revoga convites', '2', pg_temp.como(:'A', 'update public.mesa_docs set data = jsonb_set(data, ''{status}'', ''"revogado"'') where kind=''invite''');
select set_config('request.jwt.claim.sub', :'C', false);
set role authenticated;
insert into resultados select 'Estranha não aceita convite revogado', 'sim', case when public.mesa_accept_invite('tok999') is null then 'sim' else 'não' end;
reset role;

select case when esperado = obtido then 'OK    ' else 'FALHA ' end || caso || '  (esperado ' || esperado || ', obtido ' || obtido || ')' from resultados;
select 'RESUMO: ' || count(*) filter (where esperado = obtido) || ' de ' || count(*) || ' casos passaram' from resultados;
