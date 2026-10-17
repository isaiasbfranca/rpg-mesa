import type { Campaign, Character, Id, Invite, Member, Note, SessionLog } from "@/domain/types";

export type NewCampaign = Omit<Campaign, "id" | "createdAt" | "masterId" | "status">;
export type NewCharacter = Omit<Character, "id" | "updatedAt" | "ownerId">;
export type NewSessionLog = Omit<SessionLog, "id">;
export type NewInvite = Pick<Invite, "campaignId" | "email">;
export type InvitePreview = { invite: Invite; campaign: Campaign };
export type NewNote = Omit<Note, "id" | "authorId">;

/**
 * Contrato de persistência que as telas usam. O esqueleto roda com localStorage
 * (um usuário local, sempre mestra). A versão com servidor implementa o mesmo
 * contrato chamando Server Actions, que checam permissões em domain/permissions.
 */
export type Repository = {
  currentUserId: () => Id;
  listCampaigns: () => Promise<Campaign[]>;
  getCampaign: (id: Id) => Promise<Campaign | undefined>;
  createCampaign: (input: NewCampaign) => Promise<Campaign>;
  updateCampaign: (campaign: Campaign) => Promise<Campaign>;
  listCharacters: (campaignId: Id) => Promise<Character[]>;
  getCharacter: (id: Id) => Promise<Character | undefined>;
  createCharacter: (input: NewCharacter) => Promise<Character>;
  updateCharacter: (character: Character) => Promise<Character>;
  deleteCharacter: (id: Id) => Promise<void>;
  listSessionLogs: (campaignId: Id) => Promise<SessionLog[]>;
  createSessionLog: (input: NewSessionLog) => Promise<SessionLog>;
  updateSessionLog: (log: SessionLog) => Promise<SessionLog>;
  deleteSessionLog: (id: Id) => Promise<void>;
  listNotes: (campaignId: Id) => Promise<Note[]>;
  createNote: (input: NewNote) => Promise<Note>;
  deleteNote: (id: Id) => Promise<void>;
  listMembers: (campaignId: Id) => Promise<Member[]>;
  /** Tira um jogador da mesa. Fichas dele ficam na campanha. */
  removeMember: (campaignId: Id, userId: Id) => Promise<void>;
  listInvites: (campaignId: Id) => Promise<Invite[]>;
  createInvite: (input: NewInvite) => Promise<Invite>;
  revokeInvite: (id: Id) => Promise<void>;
  acceptInvite: (token: string) => Promise<Invite | undefined>;
  findInvite: (token: string) => Promise<Invite | undefined>;
  /** Convite com a campanha a que ele dá acesso, para quem ainda não participa dela. */
  previewInvite: (token: string) => Promise<InvitePreview | undefined>;
};
