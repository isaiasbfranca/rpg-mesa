"use client";

import { useCallback, useEffect, useState } from "react";
import { repository } from "@/data";
import { canEditCampaign, canRemoveParticipant } from "@/domain/permissions";
import { daysSince, isInviteOpen } from "@/domain/table";
import type { Character, Invite, Participant } from "@/domain/types";
import { initialsOf } from "@/components/avatar/CharacterAvatar";
import { useActor } from "@/hooks/useActor";
import { useCampaign } from "./CampaignContext";
import { RoundTable, type SeatInfo } from "./RoundTable";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const DEFAULT_SEATS = 4;
const COPIED_MS = 2000;

const inviteUrl = (token: string) => `${window.location.origin}${BASE_PATH}/convite/?t=${token}`;

export const TavolaBoard = () => {
  const { campaign } = useCampaign();
  const actor = useActor();
  const canInvite = canEditCampaign(actor, campaign);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null);

  const fetchTable = useCallback(
    () => Promise.all([repository.listCharacters(campaign.id), repository.listInvites(campaign.id), repository.listParticipants(campaign.id)]),
    [campaign.id],
  );

  const showTable = ([chars, all, seated]: [Character[], Invite[], Participant[]]) => {
    setCharacters(chars);
    setInvites(all);
    setParticipants(seated);
  };

  const load = async () => showTable(await fetchTable());

  useEffect(() => {
    fetchTable().then(showTable);
  }, [fetchTable]);

  const removeParticipant = async (participant: Participant) => {
    await repository.removeParticipant(campaign.id, participant.userId);
    setConfirmingRemoval(null);
    await load();
  };

  const open = invites.filter((i) => isInviteOpen(i));
  const link = open.find((i) => !i.email);
  const named = open.filter((i) => i.email);
  const players = characters.filter((c) => c.kind === "pj");

  const capacity = Math.max((campaign.seats ?? DEFAULT_SEATS) + 1, players.length + named.length + 1);
  const seats: SeatInfo[] = [
    { kind: "master", initials: initialsOf("Mestra"), name: "Mestra" },
    ...players.map((c): SeatInfo => ({ kind: "player", initials: initialsOf(c.name), name: c.name, sub: "personagem" })),
    ...named.map((i): SeatInfo => ({ kind: "pending", initials: initialsOf(i.email ?? "?"), name: i.email ?? "", sub: "convocado" })),
  ];
  while (seats.length < capacity) seats.push({ kind: "empty", initials: "+", name: "Vaga livre" });

  const generate = async () => {
    await Promise.all(open.filter((i) => !i.email).map((i) => repository.revokeInvite(i.id)));
    await repository.createInvite({ campaignId: campaign.id });
    setCopied(false);
    await load();
  };

  const revoke = async (invite: Invite) => {
    await repository.revokeInvite(invite.id);
    await load();
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(inviteUrl(link.token));
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      setCopied(false);
    }
  };

  const sendEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;
    const invite = await repository.createInvite({ campaignId: campaign.id, email: address });
    const body = `Você foi convocado para a mesa "${campaign.name}". Entre por este link: ${inviteUrl(invite.token)}`;
    window.location.href = `mailto:${encodeURIComponent(address)}?subject=${encodeURIComponent(`Convocação: ${campaign.name}`)}&body=${encodeURIComponent(body)}`;
    setEmail("");
    await load();
  };

  return (
    <div className="tavola-grid">
      <section className="leather stack" aria-label="A távola" style={{ alignItems: "center" }}>
        <div className="row spread" style={{ width: "100%" }}>
          <h2 style={{ fontSize: 26 }}>A távola</h2>
          <span className="eyebrow">{seats.filter((s) => s.kind !== "empty").length} de {capacity} cadeiras</span>
        </div>
        <div className="tavola-table-wrap">
          <RoundTable seats={seats} width={440} height={460} radius={176} topSize={240}>
            {campaign.schedule ?? campaign.name}
          </RoundTable>
        </div>
      </section>

      <div className="stack" style={{ gap: 24, minWidth: 0 }}>
        {canInvite ? (
          <section className="parchment stack" aria-label="Carta de convocação" style={{ position: "relative" }}>
            <span className="wax-seal" aria-hidden>M</span>
            <p className="eyebrow">Carta de convocação</p>
            <p style={{ fontStyle: "italic", fontSize: 20 }}>
              Quem tiver este link senta à mesa de “{campaign.name}”.
            </p>
            <div className="stack" style={{ gap: 6 }}>
              <span className="eyebrow">Link da convocação</span>
              {link ? (
                <div className="row" style={{ flexWrap: "wrap" }}>
                  <code className="link-box" data-testid="invite-link">{inviteUrl(link.token)}</code>
                  <button type="button" onClick={copy}>{copied ? "Copiado" : "Copiar"}</button>
                </div>
              ) : (
                <button type="button" onClick={generate} style={{ alignSelf: "flex-start" }}>Gerar link</button>
              )}
              {link && (
                <p className="help">
                  Vale por 7 dias ou até as cadeiras se encherem.
                  <button type="button" className="link-btn" onClick={generate}>Gerar novo</button>
                  <button type="button" className="link-btn red" onClick={() => revoke(link)}>Revogar</button>
                </p>
              )}
              <p className="help">Neste esqueleto os dados ficam só neste navegador; o link funciona aqui até existir servidor.</p>
            </div>
            <div className="divider"><i /></div>
            <form className="row" onSubmit={sendEmail} style={{ alignItems: "flex-end" }}>
              <label style={{ flex: "1 1 200px" }}>
                Enviar por corvo (e-mail)
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@exemplo.com" />
              </label>
              <button type="submit">Enviar</button>
            </form>
          </section>
        ) : (
          <p className="muted subtitle">Só a mestra convoca jogadores.</p>
        )}

        <section className="stack" aria-label="Participantes" style={{ gap: 10 }}>
          <h2 style={{ fontSize: 22 }}>À mesa</h2>
          {participants.map((participant) => {
            const mine = participant.userId === actor.userId;
            const name = participant.displayName ?? (participant.role === "mestra" ? "Mestra" : "Jogador");
            return (
              <div key={participant.userId} className="invite-row">
                <span className={`token ${participant.role === "mestra" ? "master" : ""}`} aria-hidden>{initialsOf(name)}</span>
                <span className="grow">
                  <strong>{name}{mine && " (você)"}</strong>
                  <span className="subtitle" style={{ display: "block", fontSize: 14 }}>{participant.role === "mestra" ? "mestra" : "jogador"}</span>
                </span>
                {canRemoveParticipant(actor, campaign, participant) && (
                  confirmingRemoval === participant.userId ? (
                    <>
                      <button type="button" className="link-btn red" onClick={() => removeParticipant(participant)}>Confirmar remoção</button>
                      <button type="button" className="link-btn" onClick={() => setConfirmingRemoval(null)}>Cancelar</button>
                    </>
                  ) : (
                    <button type="button" className="link-btn red" onClick={() => setConfirmingRemoval(participant.userId)}>Remover</button>
                  )
                )}
              </div>
            );
          })}
        </section>

        {canInvite && named.length > 0 && (
          <section className="stack" aria-label="Convites pendentes" style={{ gap: 10 }}>
            <h2 style={{ fontSize: 22 }}>Pendentes</h2>
            {named.map((invite) => (
              <div key={invite.id} className="invite-row">
                <span className="token dashed" aria-hidden>{initialsOf(invite.email ?? "?")}</span>
                <span className="grow">
                  <strong>{invite.email}</strong>
                  <span className="subtitle" style={{ display: "block", fontSize: 14 }}>
                    convocado há {daysSince(invite.createdAt)} dias, sem resposta
                  </span>
                </span>
                <button type="button" className="link-btn" onClick={() => (window.location.href = `mailto:${encodeURIComponent(invite.email ?? "")}?body=${encodeURIComponent(inviteUrl(invite.token))}`)}>Reenviar</button>
                <button type="button" className="link-btn red" onClick={() => revoke(invite)}>Revogar</button>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
