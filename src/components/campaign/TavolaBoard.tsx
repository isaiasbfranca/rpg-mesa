"use client";

import { useCallback, useEffect, useState } from "react";
import { repository } from "@/data";
import { canEditCampaign, canRemoveMember } from "@/domain/permissions";
import { daysSince, isInviteOpen } from "@/domain/table";
import type { Character, Invite, Member } from "@/domain/types";
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
  const [members, setMembers] = useState<Member[]>([]);
  const [removingId, setRemovingId] = useState<string>();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const reload = useCallback(async () => {
    const [chars, all, team] = await Promise.all([repository.listCharacters(campaign.id), repository.listInvites(campaign.id), repository.listMembers(campaign.id)]);
    setCharacters(chars);
    setInvites(all);
    setMembers(team);
  }, [campaign.id]);

  useEffect(() => {
    Promise.all([repository.listCharacters(campaign.id), repository.listInvites(campaign.id), repository.listMembers(campaign.id)]).then(([chars, all, team]) => {
      setCharacters(chars);
      setInvites(all);
      setMembers(team);
    });
  }, [campaign.id]);

  const open = invites.filter((i) => isInviteOpen(i));
  const link = open.find((i) => !i.email);
  const named = open.filter((i) => i.email);
  const guests = members.filter((m) => m.role === "jogador");
  const memberIds = new Set(members.map((m) => m.userId));
  const players = characters.filter((c) => c.kind === "pj" && !memberIds.has(c.ownerId));
  const characterOf = (userId: string) => characters.find((c) => c.kind === "pj" && c.ownerId === userId);
  const guestName = (member: Member) => member.displayName ?? "Jogador";

  const capacity = Math.max((campaign.seats ?? DEFAULT_SEATS) + 1, guests.length + players.length + named.length + 1);
  const seats: SeatInfo[] = [
    { kind: "master", initials: initialsOf("Mestra"), name: "Mestra" },
    ...guests.map((m): SeatInfo => ({ kind: "player", initials: initialsOf(guestName(m)), name: guestName(m), sub: characterOf(m.userId)?.name ?? "jogador" })),
    ...players.map((c): SeatInfo => ({ kind: "player", initials: initialsOf(c.name), name: c.name, sub: "personagem" })),
    ...named.map((i): SeatInfo => ({ kind: "pending", initials: initialsOf(i.email ?? "?"), name: i.email ?? "", sub: "convocado" })),
  ];
  while (seats.length < capacity) seats.push({ kind: "empty", initials: "+", name: "Vaga livre" });

  const generate = async () => {
    await Promise.all(open.filter((i) => !i.email).map((i) => repository.revokeInvite(i.id)));
    await repository.createInvite({ campaignId: campaign.id });
    setCopied(false);
    await reload();
  };

  const removeGuest = async (member: Member) => {
    await repository.removeMember(campaign.id, member.userId);
    setRemovingId(undefined);
    await reload();
  };

  const revoke = async (invite: Invite) => {
    await repository.revokeInvite(invite.id);
    await reload();
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
    await reload();
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
          <h2 style={{ fontSize: 22 }}>Participantes</h2>
          {members.map((member) => (
            <div key={member.userId} className="invite-row">
              <span className="token" aria-hidden>{initialsOf(member.role === "mestra" ? "Mestra" : guestName(member))}</span>
              <span className="grow">
                <strong>{member.role === "mestra" ? (member.displayName ?? "Mestra") : guestName(member)}</strong>
                <span className="subtitle" style={{ display: "block", fontSize: 14 }}>
                  {member.role === "mestra" ? "mestra" : "jogador"}
                  {characterOf(member.userId) && ` · ${characterOf(member.userId)?.name}`}
                </span>
              </span>
              {canRemoveMember(actor, member) &&
                (removingId === member.userId ? (
                  <>
                    <button type="button" className="link-btn red" onClick={() => removeGuest(member)}>Confirmar remoção de {guestName(member)}</button>
                    <button type="button" className="link-btn" onClick={() => setRemovingId(undefined)}>Cancelar</button>
                  </>
                ) : (
                  <button type="button" className="link-btn red" onClick={() => setRemovingId(member.userId)} aria-label={`Remover ${guestName(member)}`}>Remover</button>
                ))}
            </div>
          ))}
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
