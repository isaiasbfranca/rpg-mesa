import type { Avatar } from "./avatar";
import type { SheetTemplate, FieldValue, ModifierRule } from "./sheet";

export type Id = string;

export type Role = "mestra" | "jogador";

export type Campaign = {
  id: Id;
  name: string;
  system: string;
  description: string;
  masterId: Id;
  modifierRule: ModifierRule;
  /** Dado usado na rolagem a partir de atributo (RF-13). */
  defaultDie: number;
  status: "ativa" | "arquivada";
  /** Cadeiras de jogadores à mesa (sem contar a mestra); campanhas antigas não têm. */
  seats?: number;
  /** Frequência dos encontros, texto livre (opcional). */
  schedule?: string;
  template: SheetTemplate;
  createdAt: string;
};

export type Membership = { campaignId: Id; userId: Id; role: Role };

export type Character = {
  id: Id;
  campaignId: Id;
  ownerId: Id;
  kind: "pj" | "npc";
  hidden: boolean;
  name: string;
  /** Aparência (E12); ausente até o jogador escolher uma. */
  avatar?: Avatar;
  values: Record<string, FieldValue>;
  updatedAt: string;
};

export type SessionLog = {
  id: Id;
  campaignId: Id;
  date: string;
  title: string;
  summary: string;
};

export type NoteCategory = "npc" | "local" | "item" | "outro";

export type Note = {
  id: Id;
  campaignId: Id;
  authorId: Id;
  title: string;
  body: string;
  visibility: "privada" | "campanha";
  category?: NoteCategory;
};

export type InviteStatus = "pendente" | "aceito" | "revogado";

/** Convite por link (E2). O token tem 128 bits; com servidor, ele é a única credencial do link. */
export type Invite = {
  id: Id;
  campaignId: Id;
  token: string;
  email?: string;
  status: InviteStatus;
  createdAt: string;
};
