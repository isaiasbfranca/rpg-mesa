-- Rode uma vez no Supabase: SQL Editor > New query > colar > Run.
-- Guarda cada campanha, personagem, sessão, nota e convite como um documento JSON do dono da conta.
create table if not exists public.mesa_docs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('campaign', 'character', 'sessionLog', 'note', 'invite')),
  id uuid not null,
  campaign_id uuid,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, id)
);

create index if not exists mesa_docs_campaign_idx on public.mesa_docs (user_id, kind, campaign_id);

alter table public.mesa_docs enable row level security;

-- Cada pessoa lê e grava só os próprios documentos.
drop policy if exists "dono acessa os próprios documentos" on public.mesa_docs;
create policy "dono acessa os próprios documentos" on public.mesa_docs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
